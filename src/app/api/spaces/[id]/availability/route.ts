import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { availabilitySchema } from '@/lib/validations'

// GET /api/spaces/[id]/availability - Buscar disponibilidade de uma vaga
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = { spaceId: (await params).id }
    
    if (startDate) {
      where.date = { gte: new Date(startDate) }
    }
    if (endDate) {
      where.date = { ...(where.date as object), lte: new Date(endDate) }
    }

    const availability = await db.availability.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    // Buscar também reservas confirmadas para mostrar indisponibilidade
    const bookings = await db.booking.findMany({
      where: {
        spaceId: (await params).id,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        ...(startDate && endDate ? {
          OR: [
            {
              startDateTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              endDateTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            }
          ]
        } : {})
      },
      select: {
        id: true,
        startDateTime: true,
        endDateTime: true,
        status: true,
      }
    })

    return NextResponse.json({
      availability,
      bookings,
    })
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/spaces/[id]/availability - Criar disponibilidade
export async function POST(
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

    const body = await request.json()
    const validatedData = availabilitySchema.parse({
      ...body,
      spaceId: (await params).id
    })

    // Verificar se o usuário é o proprietário da vaga
    const space = await db.parkingSpace.findUnique({
      where: { id: (await params).id },
      select: { ownerId: true }
    })

    if (!space || space.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Você não tem permissão para gerenciar esta vaga' },
        { status: 403 }
      )
    }

    // Verificar se já existe disponibilidade para esta data/hora
    const existingAvailability = await db.availability.findFirst({
      where: {
        spaceId: (await params).id,
        date: validatedData.date,
        OR: [
          {
            startTime: {
              lt: validatedData.endTime,
              gte: validatedData.startTime
            }
          },
          {
            endTime: {
              gt: validatedData.startTime,
              lte: validatedData.endTime
            }
          }
        ]
      }
    })

    if (existingAvailability) {
      return NextResponse.json(
        { message: 'Já existe disponibilidade configurada para este horário' },
        { status: 400 }
      )
    }

    const newAvailability = await db.availability.create({
      data: validatedData,
    })

    return NextResponse.json(newAvailability, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar disponibilidade:', error)
    
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

// PUT /api/spaces/[id]/availability - Atualizar disponibilidade
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

    const body = await request.json()
    const { availabilityId, ...updateData } = body

    if (!availabilityId) {
      return NextResponse.json(
        { message: 'ID da disponibilidade é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a disponibilidade existe e pertence à vaga
    const existingAvailability = await db.availability.findFirst({
      where: {
        id: availabilityId,
        spaceId: (await params).id
      }
    })

    if (!existingAvailability) {
      return NextResponse.json(
        { message: 'Disponibilidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é o proprietário da vaga
    const space = await db.parkingSpace.findUnique({
      where: { id: (await params).id },
      select: { ownerId: true }
    })

    if (!space || space.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Você não tem permissão para gerenciar esta vaga' },
        { status: 403 }
      )
    }

    const updatedAvailability = await db.availability.update({
      where: { id: availabilityId },
      data: updateData,
    })

    return NextResponse.json(updatedAvailability)
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/spaces/[id]/availability - Deletar disponibilidade
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

    const { searchParams } = new URL(request.url)
    const availabilityId = searchParams.get('availabilityId')

    if (!availabilityId) {
      return NextResponse.json(
        { message: 'ID da disponibilidade é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a disponibilidade existe e pertence à vaga
    const existingAvailability = await db.availability.findFirst({
      where: {
        id: availabilityId,
        spaceId: (await params).id
      }
    })

    if (!existingAvailability) {
      return NextResponse.json(
        { message: 'Disponibilidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é o proprietário da vaga
    const space = await db.parkingSpace.findUnique({
      where: { id: (await params).id },
      select: { ownerId: true }
    })

    if (!space || space.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Você não tem permissão para gerenciar esta vaga' },
        { status: 403 }
      )
    }

    await db.availability.delete({
      where: { id: availabilityId }
    })

    return NextResponse.json({ message: 'Disponibilidade deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar disponibilidade:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}