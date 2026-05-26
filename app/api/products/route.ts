import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireBaker, getBakerProfile } from '@/lib/auth'
import { calculateKBJU } from '@/lib/nutrition'
import fs from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  const session = await requireBaker()
  const baker = await getBakerProfile(session.user.id)

  const products = await prisma.product.findMany({
    where: { bakerProfileId: baker.id },
    include: { ingredients: { include: { ingredient: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(products, {
    headers: { 'Cache-Control': 'no-store, must-revalidate' },
  })
}

export async function POST(req: NextRequest) {
  const session = await requireBaker()
  const baker = await getBakerProfile(session.user.id)

  const { name, description, photo, ingredients, koef } =
    await req.json()
  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 })
  }

  let photoToSave = photo
  if (photo && typeof photo === 'string' && photo.startsWith('data:')) {
    const match = photo.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }
    const mime = match[1]
    const b64 = match[2]
    const buffer = Buffer.from(b64, 'base64')
    const maxBytes = 5 * 1024 * 1024
    if (buffer.length > maxBytes) {
      return NextResponse.json(
        { error: 'Image too large (max 5MB)' },
        { status: 413 }
      )
    }

    const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1] || 'bin'
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = path.join(uploadsDir, filename)
    await fs.writeFile(filePath, buffer)
    photoToSave = `/uploads/${filename}`
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        photo: photoToSave,
        koef: koef ? parseFloat(koef) : null,
        bakerProfileId: baker.id,
        ingredients: ingredients?.length
          ? {
              create: ingredients.map(
                (ing: {
                  ingredientId: string
                  weight: number
                  metric?: string
                }) => ({
                  ingredientId: ing.ingredientId,
                  weight: ing.weight,
                  metric: ing.metric,
                })
              ),
            }
          : undefined,
      },
      include: { ingredients: { include: { ingredient: true } } },
    })

    const calculated = calculateKBJU(
      product.ingredients.map((i) => ({
        weight: i.weight,
        ingredient: {
          kcal: i.ingredient.kcal,
          protein: i.ingredient.protein,
          fat: i.ingredient.fat,
          carbs: i.ingredient.carbs,
        },
      })),
      product.koef
    )

    await prisma.product.update({
      where: { id: product.id },
      data: {
        kcal: calculated.kcal,
        protein: calculated.protein,
        fat: calculated.fat,
        carbs: calculated.carbs,
      },
    })

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { ingredients: { include: { ingredient: true } } },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  await requireBaker()

  const {
    id,
    name,
    description,
    photo,
    ingredients,
    koef,
  } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    if (ingredients) {
      await prisma.productIngredient.deleteMany({ where: { productId: id } })
      if (ingredients.length > 0) {
        await prisma.productIngredient.createMany({
          data: ingredients.map(
            (ing: {
              ingredientId: string
              weight: number
              metric?: string
            }) => ({
              productId: id,
              ingredientId: ing.ingredientId,
              weight: ing.weight,
              metric: ing.metric,
            })
          ),
        })
      }
    }

    let photoToSave = photo
    if (photo && typeof photo === 'string' && photo.startsWith('data:')) {
      const match = photo.match(/^data:(image\/\w+);base64,(.+)$/)
      if (!match) {
        return NextResponse.json(
          { error: 'Invalid image data' },
          { status: 400 }
        )
      }
      const mime = match[1]
      const b64 = match[2]
      const buffer = Buffer.from(b64, 'base64')
      const maxBytes = 5 * 1024 * 1024
      if (buffer.length > maxBytes) {
        return NextResponse.json(
          { error: 'Image too large (max 5MB)' },
          { status: 413 }
        )
      }

      const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1] || 'bin'
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(uploadsDir, { recursive: true })
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = path.join(uploadsDir, filename)
      await fs.writeFile(filePath, buffer)
      photoToSave = `/uploads/${filename}`
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        photo: photoToSave,
        koef:
          koef !== undefined
            ? koef
              ? parseFloat(koef)
              : null
            : undefined,
      },
      include: { ingredients: { include: { ingredient: true } } },
    })

    const calculated = calculateKBJU(
      product.ingredients.map((i) => ({
        weight: i.weight,
        ingredient: {
          kcal: i.ingredient.kcal,
          protein: i.ingredient.protein,
          fat: i.ingredient.fat,
          carbs: i.ingredient.carbs,
        },
      })),
      product.koef
    )

    await prisma.product.update({
      where: { id },
      data: {
        kcal: calculated.kcal,
        protein: calculated.protein,
        fat: calculated.fat,
        carbs: calculated.carbs,
      },
    })

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { ingredients: { include: { ingredient: true } } },
    })

    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update product' },
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
    await prisma.productIngredient.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
