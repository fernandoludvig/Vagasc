import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { sessionId } = await params

    // Buscar a reserva pelo session_id do Stripe
    const booking = await prisma.booking.findFirst({
      where: {
        stripeSessionId: sessionId,
        userId: session.user.id
      },
      include: {
        space: {
          select: {
            title: true,
            address: true
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

    return NextResponse.json({
      booking: {
        id: booking.id,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
        totalAmount: booking.totalAmount,
        space: {
          title: booking.space.title,
          address: booking.space.address
        }
      }
    })

  } catch (error) {
    console.error('Erro ao buscar reserva por session_id:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
