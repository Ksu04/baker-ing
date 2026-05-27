import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  Role,
  requireAuth,
  getBakerProfile,
  getCustomerProfile,
} from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await requireAuth()

  if (session.user.role === Role.CUSTOMER) {
    const bookings = await prisma.booking.findMany({
      where: { customerId: session.user.id },
      include: { 
        postProduct: { 
          include: { 
            product: { 
              include: { ingredients: { include: { ingredient: true } } } 
            }, 
            post: { include: { bakerProfile: { include: { user: true } } } } 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' },
    })

    const groupedByPost = bookings.reduce((acc, booking) => {
      const postId = booking.postProduct.post.id
      const bakerProfile = booking.postProduct.post.bakerProfile
      if (!bakerProfile) return acc

      if (!acc[postId]) {
        acc[postId] = {
          postId,
          postTitle: booking.postProduct.post.title,
          postDescription: booking.postProduct.post.description,
          pickupDate: booking.postProduct.post.pickupDate.toISOString(),
          createdAt: booking.createdAt.toISOString(),
          baker: {
            id: bakerProfile.id,
            name: bakerProfile.user.name,
            bio: bakerProfile.bio,
            avatar: null,
          },
          items: [],
        }
      }
      const product = booking.postProduct.product
      const ingredientsList = product.ingredients
        .map(i => i.ingredient.name)
        .join(', ')
      acc[postId].items.push({
        id: booking.id,
        quantity: booking.quantity,
        price: booking.postProduct.price,
        product: {
          name: product.name,
          description: product.description,
          photo: product.photo,
          ingredients: ingredientsList || null,
          kcal: product.kcal,
          protein: product.protein,
          fat: product.fat,
          carbs: product.carbs,
          koef: product.koef,
          ingredientList: product.ingredients.map(i => ({
            id: i.id,
            weight: i.weight,
            metric: i.metric,
            ingredient: {
              name: i.ingredient.name,
              kcal: i.ingredient.kcal,
              protein: i.ingredient.protein,
              fat: i.ingredient.fat,
              carbs: i.ingredient.carbs,
            },
          })),
        },
      })
      return acc
    }, {} as Record<string, {
      postId: string
      postTitle: string
      postDescription: string | null
      pickupDate: string
      createdAt: string
      baker: { id: string; name: string | null; bio: string | null; avatar: string | null }
      items: { id: string; quantity: number; price: number; product: { name: string; description: string | null; photo: string | null; ingredients: string | null; kcal: number | null; protein: number | null; fat: number | null; carbs: number | null } }[]
    }>)

    return NextResponse.json(Object.values(groupedByPost))
  }

  const baker = await getBakerProfile(session.user.id)

  const postProducts = await prisma.postProduct.findMany({
    where: { post: { bakerProfileId: baker.id } },
    select: { id: true },
  })
  const ids = postProducts.map((p) => p.id)

  const bookings = await prisma.booking.findMany({
    where: { postProductId: { in: ids } },
    include: {
      postProduct: {
        include: {
          product: true,
          post: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const session = await requireAuth()
  if (session.user.role !== Role.CUSTOMER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customer = await getCustomerProfile(session.user.id)
  const body = await req.json()
  const items = Array.isArray(body.items)
    ? body.items
    : [{ postProductId: body.postProductId, quantity: body.quantity }]

  const validItems = items.filter(
    (item: { postProductId: string; quantity: number }) =>
      item.postProductId && item.quantity > 0
  )

  if (validItems.length === 0) {
    return NextResponse.json(
      { error: 'No valid items to book' },
      { status: 400 }
    )
  }

  const postProductIds = validItems.map(
    (item: { postProductId: string }) => item.postProductId
  )

  const postProducts = await prisma.postProduct.findMany({
    where: { id: { in: postProductIds } },
    include: { post: { include: { bakerProfile: true } }, product: true },
  })

  const productMap = new Map(postProducts.map((pp) => [pp.id, pp]))

  for (const item of validItems) {
    const postProduct = productMap.get(item.postProductId)
    if (!postProduct) {
      return NextResponse.json(
        { error: `Product ${item.postProductId} not found` },
        { status: 404 }
      )
    }
    if (new Date(postProduct.post.pickupDate) < new Date()) {
      return NextResponse.json(
        { error: 'This post has expired' },
        { status: 400 }
      )
    }
    if (postProduct.availableQuantity < item.quantity) {
      return NextResponse.json(
        { error: `Not enough available for product` },
        { status: 400 }
      )
    }
  }

  const bakerNotifications: { bakerProfileId: string; productName: string; quantity: number; postId: string }[] = []

  await prisma.$transaction(async (tx) => {
    for (const item of validItems) {
      const postProduct = productMap.get(item.postProductId)
      const productName = postProduct?.product?.name || 'Unknown Product'

      await tx.booking.create({
        data: {
          customerId: session.user.id,
          customerProfileId: customer.id,
          postProductId: item.postProductId,
          quantity: item.quantity,
        },
      })

      await tx.postProduct.update({
        where: { id: item.postProductId },
        data: { availableQuantity: { decrement: item.quantity } },
      })

      if (postProduct?.post?.bakerProfileId) {
        bakerNotifications.push({
          bakerProfileId: postProduct.post.bakerProfileId,
          productName,
          quantity: item.quantity,
          postId: postProduct.post.id,
        })
      }
    }

    for (const notification of bakerNotifications) {
      await tx.notification.create({
        data: {
          bakerProfileId: notification.bakerProfileId,
          type: 'NEW_BOOKING',
          message: `New booking: ${notification.quantity}x ${notification.productName}`,
          data: { postId: notification.postId },
        },
      })
    }
  })

  return NextResponse.json({ success: true })
}
