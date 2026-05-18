import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireBaker, getBakerProfile } from '@/lib/auth'
import { randomBytes } from 'crypto'

export async function GET(req: NextRequest) {
  const session = await requireBaker()
  const baker = await getBakerProfile(session.user.id)

  const invites = await prisma.inviteToken.findMany({
    where: { bakerProfileId: baker.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invites)
}

export async function POST(req: NextRequest) {
  const session = await requireBaker()
  const baker = await getBakerProfile(session.user.id)

  const code = randomBytes(12).toString('hex')
  const invite = await prisma.inviteToken.create({
    data: {
      code,
      bakerProfileId: baker.id,
    },
  })

  const url = `${new URL(req.url).origin}/register/${invite.code}`
  return NextResponse.json({
    inviteUrl: url,
    id: invite.id,
    code: invite.code,
    active: invite.active,
    createdAt: invite.createdAt,
  })
}

export async function PUT(req: NextRequest) {
  await requireBaker()

  const { id, active } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    const invite = await prisma.inviteToken.update({
      where: { id },
      data: { active },
    })
    return NextResponse.json(invite)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  await requireBaker()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    await prisma.inviteToken.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
