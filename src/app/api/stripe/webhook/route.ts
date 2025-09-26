import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { message: 'Assinatura do Stripe não encontrada' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy_secret'
      )
    } catch (err) {
      console.error('Erro ao verificar assinatura do webhook:', err)
      return NextResponse.json(
        { message: 'Assinatura inválida' },
        { status: 400 }
      )
    }

    // Processar o evento
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Erro no webhook do Stripe:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { bookingId, userId, spaceId, ownerId, platformFee, ownerAmount } = session.metadata || {}

    if (!bookingId || !userId || !spaceId || !ownerId) {
      console.error('Metadados incompletos na sessão:', session.metadata)
      return
    }

    // Atualizar a reserva como paga
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent as string
      }
    })

    // Criar transação de pagamento
    try {
      await prisma.payment.create({
        data: {
          bookingId,
          amount: parseInt(session.amount_total?.toString() || '0') as any,
          platformFee: parseInt(platformFee || '0') as any,
          ownerAmount: parseInt(ownerAmount || '0') as any,
          status: 'PAID' as any,
          stripePaymentIntentId: session.payment_intent as string,
          stripeSessionId: session.id
        }
      })
    } catch (error) {
      console.error('Erro ao criar pagamento:', error)
    }

    // Atualizar estatísticas do espaço
    // TODO: Implementar estatísticas da vaga quando campos estiverem no schema
    // await prisma.parkingSpace.update({
    //   where: { id: spaceId },
    //   data: {
    //     totalBookings: {
    //       increment: 1
    //     }
    //   }
    // })

    console.log(`Pagamento processado com sucesso para reserva ${bookingId}`)

  } catch (error) {
    console.error('Erro ao processar checkout session completed:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Buscar a reserva pelo payment_intent_id
    const booking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      }
    })

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paidAt: new Date()
        }
      })

      console.log(`Payment Intent processado com sucesso para reserva ${booking.id}`)
    }

  } catch (error) {
    console.error('Erro ao processar payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Buscar a reserva pelo payment_intent_id
    const booking = await prisma.booking.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      }
    })

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      })

      console.log(`Payment Intent falhou para reserva ${booking.id}`)
    }

  } catch (error) {
    console.error('Erro ao processar payment intent failed:', error)
  }
}
