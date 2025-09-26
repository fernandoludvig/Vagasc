'use client'

import { useState, useEffect } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    stripePromise.then((stripeInstance) => {
      setStripe(stripeInstance)
      setIsLoading(false)
    })
  }, [])

  const createCheckoutSession = async (bookingId: string, spaceId: string) => {
    if (!stripe) {
      throw new Error('Stripe não carregado')
    }

    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        spaceId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar sessão de pagamento')
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    })

    if (error) {
      throw new Error(error.message || 'Erro ao redirecionar para o checkout')
    }
  }

  return {
    stripe,
    isLoading,
    createCheckoutSession,
  }
}
