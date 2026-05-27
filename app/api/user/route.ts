import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { requireAuth } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  const session = await requireAuth()
  const userId = session.user.id

  const { name, phone, currentPassword, newPassword } = await req.json()

  if (!name && phone === undefined && !newPassword) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password required' }, { status: 400 })
    }
    if (!user.password) {
      return NextResponse.json({ error: 'No password set for this account' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }
  }

  if (phone !== undefined && phone !== '' && phone !== user.phone) {
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: 'Phone already in use' }, { status: 400 })
    }
  }

  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (phone !== undefined) data.phone = phone || null
  if (newPassword) data.password = await bcrypt.hash(newPassword, 10)

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  })

  return NextResponse.json(updated)
}
