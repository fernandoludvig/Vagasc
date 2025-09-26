import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Testar se o Stripe está configurado
    const apiKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!apiKey || !publishableKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Chaves do Stripe não configuradas',
        details: {
          hasSecretKey: !!apiKey,
          hasPublishableKey: !!publishableKey
        }
      }, { status: 400 })
    }

    // Testar conexão com Stripe
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({
      status: 'success',
      message: 'Stripe configurado corretamente',
      details: {
        accountId: account.id,
        country: account.country,
        currency: account.default_currency,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled
      }
    })

  } catch (error) {
    console.error('Erro ao testar Stripe:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao conectar com Stripe',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
