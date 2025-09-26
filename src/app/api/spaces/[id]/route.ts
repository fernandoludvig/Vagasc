import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { parkingSpaceSchema } from '@/lib/validations'

// GET /api/spaces/[id] - Buscar vaga específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const space = await db.parkingSpace.findUnique({
      where: { id: (await params).id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            createdAt: true,
          }
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        availability: {
          where: {
            isBlocked: false,
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          }
        }
      }
    })

    if (!space) {
      return NextResponse.json(
        { message: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // Calcular rating médio
    const avgRating = space.reviews.length > 0 
      ? space.reviews.reduce((sum, review) => sum + review.rating, 0) / space.reviews.length
      : 0

    const spaceWithRating = {
      ...space,
      averageRating: Math.round(avgRating * 10) / 10,
    }

    return NextResponse.json(spaceWithRating)
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/spaces/[id] - Atualizar vaga
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se a vaga existe e se o usuário é o proprietário
    const existingSpace = await db.parkingSpace.findUnique({
      where: { id: (await params).id },
      select: { ownerId: true }
    })

    if (!existingSpace) {
      return NextResponse.json(
        { message: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    if (existingSpace.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Você não tem permissão para editar esta vaga' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = parkingSpaceSchema.partial().parse(body)

    const updatedSpace = await db.parkingSpace.update({
      where: { id: (await params).id },
      data: validatedData,
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

    return NextResponse.json(updatedSpace)
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/spaces/[id] - Deletar vaga
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se a vaga existe e se o usuário é o proprietário
    const existingSpace = await db.parkingSpace.findUnique({
      where: { id: (await params).id },
      select: { 
        ownerId: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!existingSpace) {
      return NextResponse.json(
        { message: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    if (existingSpace.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Você não tem permissão para deletar esta vaga' },
        { status: 403 }
      )
    }

    // Verificar se há reservas ativas
    if (existingSpace._count.bookings > 0) {
      return NextResponse.json(
        { message: 'Não é possível deletar uma vaga com reservas ativas' },
        { status: 400 }
      )
    }

    await db.parkingSpace.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ message: 'Vaga deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar vaga:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
