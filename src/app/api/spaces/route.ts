import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { parkingSpaceSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// GET /api/spaces - Listar vagas (com filtros opcionais)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const ownerId = searchParams.get('ownerId')
    const isActive = searchParams.get('isActive')
    const spaceType = searchParams.get('spaceType')
    const vehicleType = searchParams.get('vehicleType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {}

    if (ownerId) {
      where.ownerId = ownerId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (spaceType) {
      where.spaceType = spaceType
    }

    if (vehicleType) {
      where.vehicleTypes = {
        has: vehicleType
      }
    }

    if (minPrice || maxPrice) {
      const orConditions: any[] = []
      if (minPrice) {
        orConditions.push({
          pricePerHour: {
            gte: parseFloat(minPrice)
          }
        })
      }
      if (maxPrice) {
        orConditions.push({
          pricePerHour: {
            lte: parseFloat(maxPrice)
          }
        })
      }
      where.OR = orConditions
    }

    const skip = (page - 1) * limit

    const [spaces, total] = await Promise.all([
      db.parkingSpace.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          reviews: {
            select: {
              rating: true,
            }
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      db.parkingSpace.count({ where })
    ])

    // Calcular rating médio para cada vaga
    const spacesWithRating = spaces.map(space => {
      const avgRating = space.reviews.length > 0 
        ? space.reviews.reduce((sum, review) => sum + review.rating, 0) / space.reviews.length
        : 0

      return {
        ...space,
        averageRating: Math.round(avgRating * 10) / 10,
        reviews: undefined, // Remover reviews do response
      }
    })

    return NextResponse.json({
      spaces: spacesWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/spaces - Criar nova vaga
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Dados recebidos na API:', body)
    console.log('SpaceType recebido:', body.spaceType)
    console.log('VehicleTypes recebidos:', body.vehicleTypes)
    console.log('Amenities recebidas:', body.amenities)
    
    const validatedData = parkingSpaceSchema.parse(body)

    const space = await db.parkingSpace.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json(space, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar vaga:', error)
    
    if (error instanceof ZodError) {
      console.error('Erro de validação Zod:', error)
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
