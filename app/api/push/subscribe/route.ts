import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth as getSession } from '@/auth'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const subs = await prisma.pushSubscription.findMany({
    where: { userId: session.user.id },
    select: { id: true, endpoint: true, createdAt: true, userAgent: true },
  })
  return NextResponse.json({ subscriptions: subs })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { endpoint, p256dh, auth } = await req.json()

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, userAgent: req.headers.get('user-agent') },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth,
        userAgent: req.headers.get('user-agent'),
      },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { endpoint } = await req.json()

  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id, endpoint },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
