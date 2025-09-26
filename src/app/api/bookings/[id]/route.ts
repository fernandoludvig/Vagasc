import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/bookings/[id] - Buscar reserva específica
export async function GET(
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

    const booking = await db.booking.findUnique({
      where: { id: (await params).id },
      include: {
        space: {
          select: {
            id: true,
            title: true,
            description: true,
            address: true,
            latitude: true,
            longitude: true,
            images: true,
            pricePerHour: true,
            pricePerDay: true,
            instructions: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          }
        },
        review: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { message: 'Reserva não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem acesso a esta reserva
    const isOwner = booking.userId === session.user.id
    const isHost = booking.space.owner.id === session.user.id

    if (!isOwner && !isHost) {
      return NextResponse.json(
        { message: 'Você não tem permissão para ver esta reserva' },
        { status: 403 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Erro ao buscar reserva:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Atualizar reserva
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
    const { action, ...updateData } = body

    // Buscar a reserva
    const existingBooking = await db.booking.findUnique({
      where: { id: (await params).id },
      include: {
        space: {
          select: {
            ownerId: true,
            title: true,
          }
        }
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { message: 'Reserva não encontrada' },
        { status: 404 }
      )
    }

    const isOwner = existingBooking.userId === session.user.id
    const isHost = existingBooking.space.ownerId === session.user.id

    if (!isOwner && !isHost) {
      return NextResponse.json(
        { message: 'Você não tem permissão para editar esta reserva' },
        { status: 403 }
      )
    }

    let updatedBooking

    // Processar ações específicas
    switch (action) {
      case 'confirm':
        if (!isHost) {
          return NextResponse.json(
            { message: 'Apenas o proprietário pode confirmar reservas' },
            { status: 403 }
          )
        }
        
        if (existingBooking.status !== 'PENDING') {
          return NextResponse.json(
            { message: 'Apenas reservas pendentes podem ser confirmadas' },
            { status: 400 }
          )
        }

        updatedBooking = await db.booking.update({
          where: { id: (await params).id },
          data: {
            status: 'CONFIRMED',
          },
          include: {
            space: {
              select: {
                id: true,
                title: true,
                address: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        })
        break

      case 'cancel':
        if (!isOwner && !isHost) {
          return NextResponse.json(
            { message: 'Você não tem permissão para cancelar esta reserva' },
            { status: 403 }
          )
        }

        if (['CANCELLED', 'COMPLETED'].includes(existingBooking.status)) {
          return NextResponse.json(
            { message: 'Esta reserva não pode ser cancelada' },
            { status: 400 }
          )
        }

        updatedBooking = await db.booking.update({
          where: { id: (await params).id },
          data: {
            status: 'CANCELLED',
          },
          include: {
            space: {
              select: {
                id: true,
                title: true,
                address: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        })
        break

      case 'complete':
        if (!isHost) {
          return NextResponse.json(
            { message: 'Apenas o proprietário pode marcar como concluída' },
            { status: 403 }
          )
        }

        if (existingBooking.status !== 'CONFIRMED') {
          return NextResponse.json(
            { message: 'Apenas reservas confirmadas podem ser concluídas' },
            { status: 400 }
          )
        }

        updatedBooking = await db.booking.update({
          where: { id: (await params).id },
          data: {
            status: 'COMPLETED',
          },
          include: {
            space: {
              select: {
                id: true,
                title: true,
                address: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        })
        break

      default:
        // Atualização geral
        updatedBooking = await db.booking.update({
          where: { id: (await params).id },
          data: updateData,
          include: {
            space: {
              select: {
                id: true,
                title: true,
                address: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        })
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Deletar reserva (apenas se ainda não confirmada)
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

    const booking = await db.booking.findUnique({
      where: { id: (await params).id },
      select: {
        userId: true,
        status: true,
        space: {
          select: {
            ownerId: true,
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { message: 'Reserva não encontrada' },
        { status: 404 }
      )
    }

    // Apenas o cliente pode deletar suas próprias reservas
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Você não tem permissão para deletar esta reserva' },
        { status: 403 }
      )
    }

    // Apenas reservas pendentes podem ser deletadas
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Apenas reservas pendentes podem ser deletadas' },
        { status: 400 }
      )
    }

    await db.booking.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ message: 'Reserva deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar reserva:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
