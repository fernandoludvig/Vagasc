import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { bookingId } = await params

    // Verificar se a reserva pertence ao usuário
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id
      },
      include: {
        space: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { message: 'Reserva não encontrada' },
        { status: 404 }
      )
    }

    // Buscar avaliações da reserva
    const reviews = await prisma.review.findMany({
      where: {
        bookingId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      booking,
      reviews
    })

  } catch (error) {
    console.error('Erro ao buscar avaliações da reserva:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
