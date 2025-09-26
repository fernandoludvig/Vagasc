'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface StripeCheckoutButtonProps {
  bookingId: string
  spaceId: string
  amount: number
  disabled?: boolean
  className?: string
}

export default function StripeCheckoutButton({
  bookingId,
  spaceId,
  amount,
  disabled = false,
  className = ''
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)

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

      // Redirecionar para o checkout do Stripe
      window.location.href = data.url

    } catch (error) {
      console.error('Erro no checkout:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`w-full ${className}`}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Pagar {formatPrice(amount)}
        </>
      )}
    </Button>
  )
}
