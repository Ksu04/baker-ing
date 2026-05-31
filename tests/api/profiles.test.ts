// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma, createTestUser, cleanup, teardown } from '../helpers'

beforeAll(cleanup)
afterAll(async () => {
  await prisma.$disconnect()
  teardown()
})

describe('Profile creation', () => {
  it('creates a user with baker profile', async () => {
    const user = await prisma.user.create({
      data: {
        email: `baker-${Date.now()}@test.com`,
        name: 'Test Baker',
        role: 'BAKER',
        password: 'hashed',
      },
    })

    await prisma.bakerProfile.create({ data: { userId: user.id } })

    const profile = await prisma.bakerProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    })

    expect(profile).not.toBeNull()
    expect(profile!.user.email).toBe(user.email)
    expect(profile!.user.role).toBe('BAKER')
  })

  it('creates a user with customer profile', async () => {
    const user = await prisma.user.create({
      data: {
        email: `customer-${Date.now()}@test.com`,
        name: 'Test Customer',
        role: 'CUSTOMER',
        password: 'hashed',
      },
    })

    await prisma.customerProfile.create({ data: { userId: user.id } })

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    })

    expect(profile).not.toBeNull()
    expect(profile!.user.email).toBe(user.email)
    expect(profile!.user.role).toBe('CUSTOMER')
  })

  it('getBakerProfile auto-creates profile if missing', async () => {
    const user = await prisma.user.create({
      data: {
        email: `auto-${Date.now()}@test.com`,
        name: 'Auto Baker',
        role: 'BAKER',
        password: 'hashed',
      },
    })

    let profile = await prisma.bakerProfile.findUnique({
      where: { userId: user.id },
    })
    expect(profile).toBeNull()

    if (!profile) {
      profile = await prisma.bakerProfile.create({ data: { userId: user.id } })
    }

    expect(profile).not.toBeNull()
    expect(profile.userId).toBe(user.id)
  })

  it('prevents duplicate emails', async () => {
    const email = `dup-${Date.now()}@test.com`
    await prisma.user.create({
      data: { email, name: 'First', role: 'BAKER', password: 'hashed' },
    })

    await expect(
      prisma.user.create({
        data: { email, name: 'Second', role: 'BAKER', password: 'hashed' },
      })
    ).rejects.toThrow()
  })

  it('creates user with helper function', async () => {
    const user = await createTestUser({ role: 'CUSTOMER' })
    expect(user).toBeDefined()
    expect(user.role).toBe('CUSTOMER')
    expect(user.customerProfile).not.toBeNull()
  })
})
