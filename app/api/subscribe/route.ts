import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { auth } from '@/auth'
import { Role } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { invite, email, password } = await req.json()

  if (!invite) {
    return NextResponse.json({ error: 'Missing invite' }, { status: 400 })
  }

  const token = await prisma.inviteToken.findUnique({
    where: { code: invite, active: true },
    include: { baker: true },
  })
  if (!token) {
    return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
  }

  let user: { id: string; role: string; password: string | null; customerProfile: { id: string } | null } | null = null

  if (email && password) {
    user = await prisma.user.findUnique({
      where: { email },
      include: { customerProfile: true },
    })
    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
  } else {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { customerProfile: true },
    })
  }

  if (!user || user.role !== Role.CUSTOMER || !user.customerProfile) {
    return NextResponse.json({ error: 'Not a customer account' }, { status: 400 })
  }

  const existing = await prisma.subscription.findUnique({
    where: {
      customerId_bakerId: {
        customerId: user.customerProfile.id,
        bakerId: token.bakerProfileId,
      },
    },
  })

  if (!existing) {
    await prisma.subscription.create({
      data: {
        customerId: user.customerProfile.id,
        bakerId: token.bakerProfileId,
      },
    })
  }

  return NextResponse.json({ success: true })
}
