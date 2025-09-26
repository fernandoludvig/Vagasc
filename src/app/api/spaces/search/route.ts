import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SpaceType, VehicleType, SpaceAmenity } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('query')
    const type = searchParams.get('type')
    const vehicleTypes = searchParams.get('vehicleTypes')?.split(',') as VehicleType[] | null
    const amenities = searchParams.get('amenities')?.split(',') as SpaceAmenity[] | null
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = parseFloat(searchParams.get('radius') || '5') // km
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      isActive: true,
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (type && type !== 'all' && (type === 'COVERED' || type === 'UNCOVERED' || type === 'GARAGE' || type === 'STREET')) {
      where.spaceType = type as SpaceType
    }

    if (vehicleTypes && vehicleTypes.length > 0) {
      where.vehicleTypes = {
        hasSome: vehicleTypes,
      }
    }

    if (amenities && amenities.length > 0) {
      where.amenities = {
        hasSome: amenities,
      }
    }

    if (minPrice || maxPrice) {
      where.pricePerHour = {}
      if (minPrice) {
        where.pricePerHour.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.pricePerHour.lte = parseFloat(maxPrice)
      }
    }

    const skip = (page - 1) * limit

    const [spaces, total] = await Promise.all([
      prisma.parkingSpace.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.parkingSpace.count({ where })
    ])

    // Calcular rating médio e distância para cada vaga
    const spacesWithStats = spaces.map(space => {
      const avgRating = space.reviews.length > 0 
        ? space.reviews.reduce((sum, review) => sum + review.rating, 0) / space.reviews.length 
        : 0

      let distance = null
      if (latitude && longitude) {
        distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          space.latitude,
          space.longitude
        )
      }

      return {
        ...space,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: space._count.reviews,
        bookingCount: space._count.bookings,
        distance: distance ? Math.round(distance * 100) / 100 : null,
        reviews: undefined, // Remover reviews do response
      }
    })

    // Filtrar por raio se especificado
    let filteredSpaces = spacesWithStats
    if (latitude && longitude && radius > 0) {
      filteredSpaces = spacesWithStats.filter(space => 
        space.distance !== null && space.distance <= radius
      )
      
      // Ordenar por distância
      filteredSpaces.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return NextResponse.json({ 
      spaces: filteredSpaces,
      pagination: {
        page,
        limit,
        total: filteredSpaces.length,
        totalPages: Math.ceil(filteredSpaces.length / limit),
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

// Função para calcular distância entre dois pontos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
