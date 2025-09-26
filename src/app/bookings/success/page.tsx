'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface BookingDetails {
  id: string
  startDateTime: string
  endDateTime: string
  totalAmount: number
  space: {
    title: string
    address: string
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      fetchBookingDetails(sessionId)
    } else {
      toast.error('Sessão de pagamento não encontrada')
      router.push('/bookings')
    }
  }, [sessionId, router])

  const fetchBookingDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/bookings/session/${sessionId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes da reserva')
      }

      const data = await response.json()
      setBooking(data.booking)
      setIsLoading(false)
    } catch (error) {
      console.error('Erro ao buscar detalhes da reserva:', error)
      toast.error('Erro ao carregar detalhes da reserva')
      router.push('/bookings')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando detalhes da reserva...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive">Reserva não encontrada</p>
              <Button 
                onClick={() => router.push('/bookings')}
                className="mt-4"
              >
                Voltar às Reservas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header de Sucesso */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Pagamento Realizado com Sucesso!
            </h1>
            <p className="text-green-700">
              Sua reserva foi confirmada e o pagamento foi processado.
            </p>
          </CardContent>
        </Card>

        {/* Detalhes da Reserva */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Reserva</CardTitle>
            <CardDescription>
              Confira as informações da sua reserva confirmada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.space.title}</p>
                    <p className="text-sm text-muted-foreground">{booking.space.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(booking.startDateTime), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(booking.startDateTime), 'HH:mm', { locale: ptBR })} - {' '}
                      {format(new Date(booking.endDateTime), 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    R$ {Number(booking.totalAmount).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor pago</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Você receberá um email de confirmação com todos os detalhes da sua reserva.
                Guarde este email para referência.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => router.push('/bookings')}
            className="flex-1"
          >
            Ver Minhas Reservas
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/search')}
            className="flex-1"
          >
            Fazer Nova Reserva
          </Button>
        </div>
      </div>
    </div>
  )
}
