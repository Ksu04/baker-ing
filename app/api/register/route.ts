import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET(req: NextRequest) {
  const invite = req.nextUrl.searchParams.get('invite')
  if (!invite) {
    return NextResponse.json({ error: 'Missing invite' }, { status: 400 })
  }
  const token = await prisma.inviteToken.findUnique({
    where: { code: invite },
    select: { type: true, active: true },
  })
  if (!token || !token.active) {
    return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
  }
  return NextResponse.json({ type: token.type })
}

export async function POST(req: NextRequest) {
  const { invite, name, phone, email, password } = await req.json()
  if (!invite || !name || !email || !password) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  const inviteToken = await prisma.inviteToken.findUnique({
    where: { code: invite, active: true },
    include: { baker: true },
  })

  if (!inviteToken) {
    return NextResponse.json({ error: 'Invalid invite code.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: 'A user with that email already exists.' },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  if (inviteToken.type === 'BAKER') {
    try {
      await prisma.user.create({
        data: {
          name,
          phone,
          email,
          password: hashedPassword,
          role: 'BAKER',
          bakerProfile: { create: {} },
        },
      })
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to create baker.' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  }

  let customerUser
  try {
    customerUser = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role: 'CUSTOMER',
        customerProfile: { create: {} },
      },
      include: { customerProfile: true },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create user.' },
      { status: 500 }
    )
  }

  if (!customerUser.customerProfile) {
    return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 })
  }
  await prisma.subscription.create({
    data: {
      customerId: customerUser.customerProfile.id,
      bakerId: inviteToken.bakerProfileId,
    },
  })

  return NextResponse.json({ success: true })
}
