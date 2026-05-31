import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { mkdtempSync, rmSync, existsSync } from 'fs'
import { tmpdir } from 'os'

const testDir = mkdtempSync(resolve(tmpdir(), 'baker-test-'))
const dbPath = resolve(testDir, 'test.db')
const dbUrl = `file:${dbPath}`

process.env.DATABASE_URL = dbUrl

execSync(`cmd /c npx prisma db push --url="${dbUrl}"`, {
  env: { ...process.env, DATABASE_URL: dbUrl },
  cwd: resolve(__dirname, '..'),
  stdio: 'pipe',
})

const adapter = new PrismaBetterSqlite3({
  connectionString: dbUrl,
  url: dbUrl,
})

export const prisma = new PrismaClient({ adapter })

export async function createTestUser(overrides?: {
  email?: string
  name?: string
  role?: 'BAKER' | 'CUSTOMER'
}) {
  const email = overrides?.email || `test-${Date.now()}@test.com`
  const name = overrides?.name || 'Test User'
  const role = overrides?.role || 'BAKER'

  const user = await prisma.user.create({
    data: { email, name, role, password: 'hashed' },
  })

  if (role === 'BAKER') {
    await prisma.bakerProfile.create({ data: { userId: user.id } })
  } else {
    await prisma.customerProfile.create({ data: { userId: user.id } })
  }

  return await prisma.user.findUnique({
    where: { id: user.id },
    include: { bakerProfile: true, customerProfile: true },
  })!
}

export async function createTestIngredient(
  bakerProfileId: string,
  overrides?: {
    name?: string
    quantity?: number
    kcal?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
  }
) {
  const name = overrides?.name || `Ingredient-${Date.now()}`
  return prisma.ingredient.create({
    data: {
      name,
      quantity: overrides?.quantity ?? 1000,
      metric: 'g',
      kcal: overrides?.kcal ?? 3.64,
      protein: overrides?.protein ?? 0.1,
      fat: overrides?.fat ?? 0.01,
      carbs: overrides?.carbs ?? 0.76,
      bakerProfileId,
    },
  })
}

export async function createTestProduct(
  bakerProfileId: string,
  ingredientIds: string[],
  overrides?: { name?: string; koef?: number | null }
) {
  const name = overrides?.name || `Product-${Date.now()}`
  return prisma.product.create({
    data: {
      name,
      koef: overrides?.koef ?? null,
      bakerProfileId,
      ingredients: {
        create: ingredientIds.map((id) => ({
          ingredientId: id,
          weight: 100,
        })),
      },
    },
    include: { ingredients: { include: { ingredient: true } } },
  })
}

export async function getBakerProfile(userId: string) {
  const baker = await prisma.bakerProfile.findUnique({ where: { userId } })
  if (!baker) throw new Error('Baker profile not found')
  return baker
}

export async function getCustomerProfile(userId: string) {
  const customer = await prisma.customerProfile.findUnique({ where: { userId } })
  if (!customer) throw new Error('Customer profile not found')
  return customer
}

export async function cleanup() {
  await prisma.$executeRawUnsafe('DELETE FROM "PostProduct"')
  await prisma.$executeRawUnsafe('DELETE FROM "Booking"')
  await prisma.$executeRawUnsafe('DELETE FROM "Post"')
  await prisma.$executeRawUnsafe('DELETE FROM "ProductIngredient"')
  await prisma.$executeRawUnsafe('DELETE FROM "Product"')
  await prisma.$executeRawUnsafe('DELETE FROM "Ingredient"')
  await prisma.$executeRawUnsafe('DELETE FROM "Subscription"')
  await prisma.$executeRawUnsafe('DELETE FROM "PushSubscription"')
  await prisma.$executeRawUnsafe('DELETE FROM "Notification"')
  await prisma.$executeRawUnsafe('DELETE FROM "InviteToken"')
  await prisma.$executeRawUnsafe('DELETE FROM "CustomerProfile"')
  await prisma.$executeRawUnsafe('DELETE FROM "BakerProfile"')
  await prisma.$executeRawUnsafe('DELETE FROM "User"')
}

export function teardown() {
  rmSync(testDir, { recursive: true, force: true })
}
