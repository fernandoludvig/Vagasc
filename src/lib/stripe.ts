import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

export const formatAmountForDisplay = (amount: number, currency: string): string => {
  const numberFormat = new Intl.NumberFormat(['pt-BR'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  })
  return numberFormat.format(amount)
}

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * 0.25) // 25% da plataforma
}

export const calculateOwnerAmount = (amount: number): number => {
  return Math.round(amount * 0.75) // 75% para o proprietário
}
