import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, getBakerProfile } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await requireAuth()
  const baker = await getBakerProfile(session.user.id)

  const notifications = await prisma.notification.findMany({
    where: { bakerProfileId: baker.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(notifications)
}

export async function PUT(req: NextRequest) {
  const session = await requireAuth()
  const baker = await getBakerProfile(session.user.id)
  const body = await req.json()

  if (body.markRead && body.notificationId) {
    await prisma.notification.update({
      where: { id: body.notificationId, bakerProfileId: baker.id },
      data: { read: true },
    })
  }

  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { bakerProfileId: baker.id, read: false },
      data: { read: true },
    })
  }

  return NextResponse.json({ success: true })
}