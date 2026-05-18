import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { randomBytes } from 'crypto'

async function getBaker() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'BAKER') {
    return null
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })
  if (!user) return null
  let baker = await prisma.bakerProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!baker) {
    baker = await prisma.bakerProfile.create({
      data: { userId: session.user.id },
    })
  }
  return baker
}

export async function GET(req: NextRequest) {
  const baker = await getBaker()
  if (!baker) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invites = await prisma.inviteToken.findMany({
    where: { bakerProfileId: baker.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invites)
}

export async function POST(req: NextRequest) {
  try {
    const baker = await getBaker()
    if (!baker) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type } = await req.json().catch(() => ({ type: 'CUSTOMER' }))
    const code = randomBytes(12).toString('hex')
    const invite = await prisma.inviteToken.create({
      data: { code, bakerProfileId: baker.id, type },
    })

    const url = `${new URL(req.url).origin}/register/${invite.code}`
    return NextResponse.json({
      inviteUrl: url,
      id: invite.id,
      code: invite.code,
      type: invite.type,
      active: invite.active,
      createdAt: invite.createdAt,
    })
  } catch (err) {
    console.error('POST /api/invite error:', err)
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const baker = await getBaker()
  if (!baker) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, active } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    const invite = await prisma.inviteToken.update({
      where: { id, bakerProfileId: baker.id },
      data: { active },
    })
    return NextResponse.json(invite)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const baker = await getBaker()
  if (!baker) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    await prisma.inviteToken.delete({ where: { id, bakerProfileId: baker.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
