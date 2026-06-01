import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireBaker, getBakerProfile } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await requireBaker()
  const baker = await getBakerProfile(session.user.id)

  const ingredients = await prisma.ingredient.findMany({
    where: { bakerProfileId: baker.id },
    orderBy: { name: 'asc' },
  })

  const mapMetric = (m: string | null) => {
    if (!m) return 'г'
    const map: Record<string, string> = { g: 'г', kg: 'кг', ml: 'мл', l: 'л', pcs: 'шт', tbsp: 'ст.л.', tsp: 'ч.л.' }
    return map[m] || m
  }

  return NextResponse.json(ingredients.map((i) => ({ ...i, metric: mapMetric(i.metric) })))
}

export async function POST(req: NextRequest) {
  const session = await requireBaker()
  const baker = await getBakerProfile(session.user.id)

  const { name, quantity, metric, kcal, protein, fat, carbs } = await req.json()
  if (!name || quantity === undefined) {
    return NextResponse.json(
      { error: 'Name and quantity required' },
      { status: 400 }
    )
  }

  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        quantity,
        metric: metric || 'г',
        bakerProfileId: baker.id,
        kcal: kcal ? parseFloat(kcal) : null,
        protein: protein ? parseFloat(protein) : null,
        fat: fat ? parseFloat(fat) : null,
        carbs: carbs ? parseFloat(carbs) : null,
      },
    })
    return NextResponse.json(ingredient)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  await requireBaker()

  const { id, name, quantity, metric, kcal, protein, fat, carbs } = await req.json()
  if (!id || name === undefined || quantity === undefined) {
    return NextResponse.json(
      { error: 'ID, name and quantity required' },
      { status: 400 }
    )
  }

  try {
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        quantity,
        metric,
        kcal: kcal !== undefined ? (kcal ? parseFloat(kcal) : null) : undefined,
        protein: protein !== undefined ? (protein ? parseFloat(protein) : null) : undefined,
        fat: fat !== undefined ? (fat ? parseFloat(fat) : null) : undefined,
        carbs: carbs !== undefined ? (carbs ? parseFloat(carbs) : null) : undefined,
      },
    })
    return NextResponse.json(ingredient)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  await requireBaker()

  const { id, addQuantity } = await req.json()
  if (!id || !addQuantity || addQuantity <= 0) {
    return NextResponse.json(
      { error: 'ID and addQuantity required' },
      { status: 400 }
    )
  }

  try {
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: { quantity: { increment: addQuantity } },
    })
    return NextResponse.json(ingredient)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to add stock' },
      { status: 500 }
    )
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
    await prisma.ingredient.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Не удалось удалить ингредиент. Сначала удалите его из всех продуктов.' },
      { status: 500 }
    )
  }
}
