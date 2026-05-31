import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Role, requireAuth, requireBaker, getBakerProfile } from '@/lib/auth'
import { auth } from '@/auth'
import { webPush } from '@/lib/push'

export async function GET(req: NextRequest) {
  const session = await requireAuth()

  if (session.user.role === Role.CUSTOMER) {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!customerProfile) {
      return NextResponse.json([])
    }
    const subscriptions = await prisma.subscription.findMany({
      where: { customerId: customerProfile.id },
    })
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json([])
    }
    const bakerProfileIds = subscriptions.map((sub) => sub.bakerId)
    const posts = await prisma.post.findMany({
      where: {
        bakerProfileId: { in: bakerProfileIds },
        pickupDate: { gte: new Date() },
      },
      include: {
        products: {
          include: {
            product: {
              include: { ingredients: { include: { ingredient: true } } },
            },
          },
        },
        bakerProfile: {
          include: { user: true },
        },
      },
      orderBy: { pickupDate: 'asc' },
    })
    return NextResponse.json(posts)
  }

  if (session.user.role === Role.BAKER) {
    const baker = await getBakerProfile(session.user.id)
    const posts = await prisma.post.findMany({
      where: { bakerProfileId: baker.id },
      include: {
        products: {
          include: {
            product: {
              include: { ingredients: { include: { ingredient: true } } },
            },
          },
        },
      },
      orderBy: { pickupDate: 'asc' },
    })
    return NextResponse.json(posts)
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  await requireBaker()
  const session = await auth()
  const baker = await getBakerProfile(session!.user.id)

  const { title, description, pickupDate, products } = await req.json()
  if (!title || !pickupDate) {
    return NextResponse.json(
      { error: 'Title and pickupDate required' },
      { status: 400 }
    )
  }

  try {
    const ingredientNeeds: Record<string, number> = {}
    if (products?.length) {
      for (const p of products) {
        const product = await prisma.product.findUnique({
          where: { id: p.productId },
          include: { ingredients: true },
        })
        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${p.productId}` },
            { status: 404 }
          )
        }
        for (const pi of product.ingredients) {
          if (!pi.ingredientId || !pi.weight) continue
          const total = pi.weight * p.quantity
          ingredientNeeds[pi.ingredientId] =
            (ingredientNeeds[pi.ingredientId] ?? 0) + total
        }
      }
    }
    const ingredientIds = Object.keys(ingredientNeeds)
    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } },
    })
    for (const ing of ingredients) {
      if ((ing.quantity ?? 0) < (ingredientNeeds[ing.id] ?? 0)) {
        return NextResponse.json(
          { error: `Not enough ${ing.name} in stock.` },
          { status: 400 }
        )
      }
    }
    const post = await prisma.$transaction(async (tx) => {
      for (const [ingredientId, needed] of Object.entries(ingredientNeeds)) {
        await tx.ingredient.update({
          where: { id: ingredientId },
          data: { quantity: { decrement: needed } },
        })
      }
      return tx.post.create({
        data: {
          title,
          description,
          pickupDate: new Date(pickupDate),
          bakerId: session!.user.id,
          bakerProfileId: baker.id,
          products: products?.length
            ? {
                create: products.map(
                  (p: {
                    productId: string
                    price: number
                    quantity: number
                  }) => ({
                    productId: p.productId,
                    price: p.price,
                    totalQuantity: p.quantity,
                    availableQuantity: p.quantity,
                  })
                ),
              }
            : undefined,
        },
        include: { products: { include: { product: true } } },
      })
    })
    try {
      const subscribers = await prisma.subscription.findMany({
        where: { bakerId: baker.id },
        include: {
          customer: {
            include: {
              user: {
                include: { pushSubscriptions: true },
              },
            },
          },
        },
      })
      const subs = subscribers.flatMap(
        (s) => s.customer.user.pushSubscriptions
      )
      const payload = JSON.stringify({
        title: 'Новый пост',
        body: `${title} — скоро будет доступно!`,
        url: `/customer`,
      })
      for (const sub of subs) {
        webPush
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
          .catch(() => {})
      }
    } catch {
      // notifications are best-effort
    }

    return NextResponse.json(post)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  await requireBaker()

  const { id, title, description, pickupDate, products } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        description,
        pickupDate: pickupDate ? new Date(pickupDate) : undefined,
      },
    })

    if (products) {
      await prisma.postProduct.deleteMany({ where: { postId: id } })

      if (products.length > 0) {
        await prisma.postProduct.createMany({
          data: products.map(
            (p: { productId: string; price: number; quantity: number }) => ({
              postId: id,
              productId: p.productId,
              price: p.price,
              totalQuantity: p.quantity,
              availableQuantity: p.quantity,
            })
          ),
        })
      }
    }

    return NextResponse.json(post)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update post' },
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
    await prisma.postProduct.deleteMany({ where: { postId: id } })
    await prisma.post.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
