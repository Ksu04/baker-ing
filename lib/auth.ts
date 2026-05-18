import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'

export const Role = {
  BAKER: 'BAKER',
  CUSTOMER: 'CUSTOMER',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export async function requireAuth(): Promise<Session> {
  const session = await auth()
  if (!session?.user?.id) {
    throw errorResponse('Unauthorized', 401)
  }
  return session
}

export async function requireBaker(): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== Role.BAKER) {
    throw errorResponse('Unauthorized', 401)
  }
  return session
}

export async function requireCustomer(): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== Role.CUSTOMER) {
    throw errorResponse('Unauthorized', 401)
  }
  return session
}

export async function getBakerProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  if (!user) {
    throw errorResponse('User not found', 401)
  }
  let baker = await prisma.bakerProfile.findUnique({
    where: { userId },
  })
  if (!baker) {
    baker = await prisma.bakerProfile.create({
      data: { userId },
    })
  }
  return baker
}

export async function getCustomerProfile(userId: string) {
  const customer = await prisma.customerProfile.findUnique({
    where: { userId },
  })
  if (!customer) {
    throw errorResponse('Customer not found', 401)
  }
  return customer
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}
