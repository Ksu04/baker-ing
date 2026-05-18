import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            include: { ingredients: { include: { ingredient: true } } },
          },
          bookings: {
            include: {
              customer: {
                select: { name: true, email: true, phone: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (session.user.role === 'BAKER' && post.bakerId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role === 'CUSTOMER') {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    })
    const isSubscribed = customerProfile
      ? !!(await prisma.subscription.findUnique({
          where: {
            customerId_bakerId: {
              customerId: customerProfile.id,
              bakerId: post.bakerProfileId ?? '',
            },
          },
        }))
      : false
    if (!isSubscribed && post.bakerProfileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.json(post)
}
