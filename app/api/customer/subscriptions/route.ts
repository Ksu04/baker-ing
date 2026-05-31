import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCustomer, getCustomerProfile } from '@/lib/auth'

export async function GET() {
  const session = await requireCustomer()
  const customer = await getCustomerProfile(session.user.id)

  const subscriptions = await prisma.subscription.findMany({
    where: { customerId: customer.id },
    include: {
      baker: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(subscriptions)
}
