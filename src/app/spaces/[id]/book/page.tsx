'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Calendar, Clock, User, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Space {
  id: string
  title: string
  description: string
  address: string
  latitude: number
  longitude: number
  images: string[]
  pricePerHour: number
  pricePerDay?: number
  spaceType: string
  vehicleTypes: string[]
  amenities: string[]
  instructions?: string
  owner: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  reviews: Array<{
    rating: number
    comment?: string
    author: {
      name: string
      avatar?: string
    }
  }>
  averageRating: number
  reviewCount: number
}

interface AvailabilityCheck {
  available: boolean
  reason?: string
  pricing?: {
    durationHours: number
    totalAmount: number
    platformFee: number
    ownerAmount: number
    pricePerHour: number
    pricePerDay?: number
  }
  booking?: {
    startDateTime: string
    endDateTime: string
  }
}

export default function BookSpacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const spaceId = params.id as string

  // Verificar se o usuário está logado
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Você precisa estar logado para fazer uma reserva')
      router.push('/login')
    }
  }, [status, router])

  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    specialRequests: '',
  })
  const [availability, setAvailability] = useState<AvailabilityCheck | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [creatingBooking, setCreatingBooking] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchSpace()
    }
  }, [status, spaceId])

  useEffect(() => {
    if (booking.startDate && booking.startTime && booking.endDate && booking.endTime) {
      checkAvailability()
    }
  }, [booking.startDate, booking.startTime, booking.endDate, booking.endTime])

  const fetchSpace = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/spaces/${spaceId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar vaga')
      }

      const data = await response.json()
      setSpace(data)
    } catch (error) {
      console.error('Erro ao buscar vaga:', error)
      toast.error('Erro ao carregar vaga')
      router.push('/spaces')
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true)
      
      const startDateTime = new Date(`${booking.startDate}T${booking.startTime}`)
      const endDateTime = new Date(`${booking.endDate}T${booking.endTime}`)

      const response = await fetch(`/api/spaces/${spaceId}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
        }),
      })

      const data = await response.json()
      setAvailability(data)
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      toast.error('Erro ao verificar disponibilidade')
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!availability?.available) {
      toast.error('Esta vaga não está disponível no horário selecionado')
      return
    }

    // Validações básicas
    if (!spaceId) {
      toast.error('ID da vaga não encontrado')
      return
    }

    if (!booking.startDate || !booking.startTime || !booking.endDate || !booking.endTime) {
      toast.error('Por favor, preencha todas as datas e horários')
      return
    }

    try {
      setCreatingBooking(true)
      
      const startDateTime = new Date(`${booking.startDate}T${booking.startTime}`)
      const endDateTime = new Date(`${booking.endDate}T${booking.endTime}`)

      // Validar se as datas são válidas
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        toast.error('Datas ou horários inválidos')
        return
      }

      // Validar se a data de fim é posterior à data de início
      if (endDateTime <= startDateTime) {
        toast.error('A data/hora de fim deve ser posterior à data/hora de início')
        return
      }

      const requestData = {
        spaceId,
        startDateTime: startDateTime.toISOString(), // Converter para string ISO
        endDateTime: endDateTime.toISOString(), // Converter para string ISO
        specialRequests: booking.specialRequests || undefined,
      }

      console.log('Enviando dados:', requestData)
      console.log('ID da vaga sendo reservada:', spaceId)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao criar reserva'
        
        console.error('Status da resposta:', response.status)
        console.error('Headers da resposta:', Object.fromEntries(response.headers.entries()))
        
        if (response.status === 401) {
          errorMessage = 'Você precisa estar logado para fazer uma reserva'
        } else {
          try {
            const errorText = await response.text()
            console.error('Resposta da API (texto):', errorText)
            
            if (errorText) {
              try {
                const error = JSON.parse(errorText)
                console.error('Erro da API (JSON):', error)
                errorMessage = error.message || errorMessage
              } catch {
                // Se não for JSON válido, usar o texto como mensagem
                errorMessage = errorText || errorMessage
              }
            } else {
              // Se não conseguir fazer parse do JSON, usar mensagem padrão baseada no status
              if (response.status === 404) {
                errorMessage = 'Vaga não encontrada'
              } else if (response.status === 400) {
                errorMessage = 'Dados inválidos para a reserva'
              } else if (response.status >= 500) {
                errorMessage = 'Erro interno do servidor'
              }
            }
          } catch (parseError) {
            console.error('Erro ao fazer parse da resposta:', parseError)
            // Usar mensagem padrão baseada no status
            if (response.status === 404) {
              errorMessage = 'Vaga não encontrada'
            } else if (response.status === 400) {
              errorMessage = 'Dados inválidos para a reserva'
            } else if (response.status >= 500) {
              errorMessage = 'Erro interno do servidor'
            }
          }
        }
        
        throw new Error(errorMessage)
      }

      const newBooking = await response.json()
      toast.success('Reserva criada com sucesso!')
      router.push(`/bookings`)
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar reserva')
    } finally {
      setCreatingBooking(false)
    }
  }

  const getMinDate = () => {
    return format(new Date(), 'yyyy-MM-dd')
  }

  const getMinEndDate = () => {
    return booking.startDate || getMinDate()
  }

  const getMinEndTime = () => {
    if (booking.startDate === booking.endDate && booking.startTime) {
      return booking.startTime
    }
    return ''
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando vaga...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold mb-4">Login Necessário</h2>
            <p className="text-gray-600 mb-6">
              Você precisa estar logado para fazer uma reserva
            </p>
            <Button onClick={() => router.push('/login')}>
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!space) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Vaga não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A vaga que você está procurando não existe ou foi removida.
          </p>
          <Button onClick={() => router.push('/spaces')}>
            Voltar para Vagas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações da Vaga */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{space.title}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {space.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {space.description && (
                <p className="text-muted-foreground">{space.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Preço por hora</Label>
                  <p className="text-2xl font-bold text-primary">
                    R$ {Number(space.pricePerHour).toFixed(2)}
                  </p>
                </div>
                {space.pricePerDay && (
                  <div>
                    <Label className="text-sm font-medium">Preço por dia</Label>
                    <p className="text-2xl font-bold text-primary">
                      R$ {Number(space.pricePerDay).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Tipo de Espaço</Label>
                  <Badge variant="outline" className="ml-2">
                    {space.spaceType}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Tipos de Veículo</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {space.vehicleTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Comodidades</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {space.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {space.instructions && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Instruções</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {space.instructions}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Avaliações */}
          {space.reviewCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Avaliações ({space.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <span className="text-3xl font-bold mr-2">{Number(space.averageRating).toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(Number(space.averageRating))
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {space.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <div className="flex items-center mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium">
                          {review.author.name}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Proprietário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Proprietário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{space.owner.name}</p>
                  <p className="text-sm text-muted-foreground">{space.owner.email}</p>
                  {space.owner.phone && (
                    <p className="text-sm text-muted-foreground">{space.owner.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Reserva */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Fazer Reserva</CardTitle>
              <CardDescription>
                Selecione as datas e horários desejados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={booking.startDate}
                      onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                      min={getMinDate()}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="startTime">Hora de Início</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={booking.startTime}
                      onChange={(e) => setBooking({ ...booking, startTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endDate">Data de Fim</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={booking.endDate}
                      onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                      min={getMinEndDate()}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Hora de Fim</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={booking.endTime}
                      onChange={(e) => setBooking({ ...booking, endTime: e.target.value })}
                      min={getMinEndTime()}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Solicitações Especiais (Opcional)</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Alguma solicitação especial?"
                    value={booking.specialRequests}
                    onChange={(e) => setBooking({ ...booking, specialRequests: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Status da Disponibilidade */}
                {checkingAvailability && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                    <span className="text-sm">Verificando disponibilidade...</span>
                  </div>
                )}

                {availability && !checkingAvailability && (
                  <div className="space-y-3">
                    {availability.available ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            Vaga disponível!
                          </span>
                        </div>
                        
                        {availability.pricing && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Duração:</span>
                              <span>{availability.pricing.durationHours} horas</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valor total:</span>
                              <span className="font-bold">
                                R$ {availability.pricing.totalAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Taxa da plataforma (15%):</span>
                              <span>R$ {availability.pricing.platformFee.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">
                            Vaga indisponível
                          </span>
                        </div>
                        <p className="text-sm text-red-700">
                          {availability.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!availability?.available || creatingBooking}
                >
                  {creatingBooking ? 'Criando Reserva...' : 'Confirmar Reserva'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
