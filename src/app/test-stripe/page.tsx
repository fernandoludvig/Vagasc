'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface StripeTestResult {
  status: 'success' | 'error'
  message: string
  details?: any
  error?: string
}

export default function TestStripePage() {
  const [testResult, setTestResult] = useState<StripeTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testStripeConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/stripe/test')
      const data = await response.json()
      
      setTestResult(data)
      
      if (data.status === 'success') {
        toast.success('Stripe configurado corretamente!')
      } else {
        toast.error('Erro na configuração do Stripe')
      }
    } catch (error) {
      const errorResult: StripeTestResult = {
        status: 'error',
        message: 'Erro ao testar conexão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
      setTestResult(errorResult)
      toast.error('Erro ao testar Stripe')
    } finally {
      setIsLoading(false)
    }
  }

  const testCheckoutSession = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: 'test-booking-id',
          spaceId: 'test-space-id',
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Checkout session criada com sucesso!')
        // Abrir checkout em nova aba
        window.open(data.url, '_blank')
      } else {
        toast.error('Erro ao criar checkout session')
        console.error('Erro:', data)
      }
    } catch (error) {
      toast.error('Erro ao testar checkout')
      console.error('Erro:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🧪 Teste do Stripe</h1>
          <p className="text-muted-foreground mt-2">
            Teste a configuração do Stripe e funcionalidades de pagamento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teste de Conexão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Teste de Conexão
              </CardTitle>
              <CardDescription>
                Verifica se o Stripe está configurado corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testStripeConnection}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar Conexão Stripe'
                )}
              </Button>

              {testResult && (
                <div className="space-y-2">
                  <Badge 
                    variant={testResult.status === 'success' ? 'default' : 'destructive'}
                    className="w-full justify-center"
                  >
                    {testResult.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    {testResult.message}
                  </Badge>

                  {testResult.details && (
                    <div className="text-sm space-y-1">
                      <p><strong>Account ID:</strong> {testResult.details.accountId}</p>
                      <p><strong>País:</strong> {testResult.details.country}</p>
                      <p><strong>Moeda:</strong> {testResult.details.currency}</p>
                      <p><strong>Cobranças:</strong> {testResult.details.chargesEnabled ? '✅' : '❌'}</p>
                      <p><strong>Pagamentos:</strong> {testResult.details.payoutsEnabled ? '✅' : '❌'}</p>
                    </div>
                  )}

                  {testResult.error && (
                    <div className="text-sm text-destructive">
                      <strong>Erro:</strong> {testResult.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teste de Checkout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Teste de Checkout
              </CardTitle>
              <CardDescription>
                Cria uma sessão de checkout de teste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testCheckoutSession}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Testar Checkout Session'
                )}
              </Button>

              <div className="text-sm text-muted-foreground">
                <p><strong>Cartão de teste:</strong> 4242 4242 4242 4242</p>
                <p><strong>Data:</strong> Qualquer data futura</p>
                <p><strong>CVC:</strong> Qualquer 3 dígitos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status das Variáveis de Ambiente */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Variáveis de Ambiente</CardTitle>
            <CardDescription>
              Verifica se as variáveis do Stripe estão configuradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span>STRIPE_SECRET_KEY</span>
                <Badge variant={process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ? 'default' : 'destructive'}>
                  {process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ? '✅' : '❌'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>STRIPE_PUBLISHABLE_KEY</span>
                <Badge variant={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'default' : 'destructive'}>
                  {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅' : '❌'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>STRIPE_WEBHOOK_SECRET</span>
                <Badge variant={process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET ? 'default' : 'destructive'}>
                  {process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET ? '✅' : '❌'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
