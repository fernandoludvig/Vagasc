'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Calendar, Clock, User, Phone, Mail, Star, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import StripeCheckoutButton from '@/components/stripe/StripeCheckoutButton'

interface Booking {
  id: string
  startDateTime: string
  endDateTime: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  specialRequests?: string
  space: {
    id: string
    title: string
    address: string
    images: string[]
    owner: {
      id: string
      name: string
      email: string
      phone?: string
    }
  }
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    type: 'SPACE_REVIEW' | 'USER_REVIEW'
  }>
}

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('client')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchBookings()
    }
  }, [status, activeTab])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookings?type=${activeTab}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar reservas')
      }

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
      toast.error('Erro ao carregar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId: string, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao processar ação')
      }

      toast.success('Ação realizada com sucesso!')
      fetchBookings()
    } catch (error) {
      console.error('Erro ao processar ação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar ação')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      CONFIRMED: 'default',
      CANCELLED: 'destructive',
      COMPLETED: 'outline',
    } as const

    const labels = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Concluída',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      PAID: 'default',
      FAILED: 'destructive',
      REFUNDED: 'outline',
    } as const

    const labels = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      FAILED: 'Falhou',
      REFUNDED: 'Reembolsado',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando reservas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minhas Reservas</h1>
        <p className="text-muted-foreground">
          Gerencie suas reservas como cliente e proprietário
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client">Como Cliente</TabsTrigger>
          <TabsTrigger value="host">Como Proprietário</TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reservas que fiz</h2>
            <Button onClick={() => router.push('/search')}>
              Nova Reserva
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não fez nenhuma reserva. Que tal encontrar uma vaga?
                </p>
                <Button onClick={() => router.push('/search')}>
                  Buscar Vagas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.space.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.space.address}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(booking.startDateTime), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(booking.startDateTime), 'HH:mm', { locale: ptBR })} - {' '}
                            {format(new Date(booking.endDateTime), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Proprietário: {booking.space.owner.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            R$ {Number(booking.totalAmount).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Valor total</p>
                        </div>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Solicitações especiais:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'PENDING' && booking.paymentStatus === 'PENDING' && (
                        <StripeCheckoutButton
                          bookingId={booking.id}
                          spaceId={booking.space.id}
                          amount={Number(booking.totalAmount)}
                          className="flex-1"
                        />
                      )}
                      
                      {booking.status === 'PENDING' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'cancel', 'Cancelado pelo cliente')}
                        >
                          Cancelar
                        </Button>
                      )}
                      
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/spaces/${booking.space.id}`)}
                        >
                          Ver Vaga
                        </Button>
                      )}

                      {booking.status === 'COMPLETED' && booking.reviews.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/reviews/${booking.id}`)}
                        >
                          Avaliar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="host" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reservas das minhas vagas</h2>
            <Button onClick={() => router.push('/user/spaces')}>
              Gerenciar Vagas
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não recebeu nenhuma reserva. Cadastre suas vagas para começar!
                </p>
                <Button onClick={() => router.push('/user/spaces')}>
                  Cadastrar Vaga
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.space.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          Cliente: {booking.user.name}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(booking.startDateTime), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(booking.startDateTime), 'HH:mm', { locale: ptBR })} - {' '}
                            {format(new Date(booking.endDateTime), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{booking.user.email}</span>
                        </div>
                        {booking.user.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{booking.user.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            R$ {Number(booking.totalAmount).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Valor total</p>
                          <p className="text-sm text-green-600">
                            Você recebe: R$ {(Number(booking.totalAmount) * 0.85).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Solicitações especiais:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                          >
                            Confirmar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, 'cancel', 'Cancelado pelo proprietário')}
                          >
                            Recusar
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'complete')}
                        >
                          Marcar como Concluída
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/spaces/${booking.space.id}`)}
                      >
                        Ver Vaga
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
