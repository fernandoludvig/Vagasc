import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { formatAmountForStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, spaceId } = body

    if (!bookingId || !spaceId) {
      return NextResponse.json(
        { message: 'ID da reserva e espaço são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar a reserva e o espaço
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id,
        status: 'PENDING'
      },
      include: {
        space: {
          include: {
            owner: true
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

    // Calcular o valor total
    const totalAmount = Number(booking.totalAmount)
    const platformFee = Math.round(totalAmount * 0.25) // 25% da plataforma
    const ownerAmount = Math.round(totalAmount * 0.75) // 75% para o proprietário

    // Criar checkout session no Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Estacionamento - ${booking.space.title}`,
              description: `Reserva de ${booking.startDateTime.toLocaleDateString('pt-BR')} às ${booking.startDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
              images: booking.space.images.length > 0 ? [booking.space.images[0]] : [],
            },
            unit_amount: formatAmountForStripe(totalAmount),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/bookings?cancelled=true`,
      metadata: {
        bookingId: bookingId,
        userId: session.user.id,
        spaceId: spaceId,
        ownerId: booking.space.ownerId,
        platformFee: platformFee.toString(),
        ownerAmount: ownerAmount.toString(),
      },
      customer_email: session.user.email || undefined,
    })

    // Atualizar a reserva com o session_id
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripeSessionId: checkoutSession.id,
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Erro ao criar checkout session:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
