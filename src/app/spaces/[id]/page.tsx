'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Star, 
  Clock, 
  Car, 
  Shield, 
  Camera, 
  Zap, 
  User,
  Calendar,
  DollarSign,
  MessageCircle,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import SpaceReviews from '@/components/reviews/SpaceReviews'

interface ParkingSpace {
  id: string
  title: string
  description: string
  address: string
  latitude: number
  longitude: number
  pricePerHour: number
  pricePerDay?: number
  spaceType: string
  vehicleTypes: string[]
  amenities: string[]
  isActive: boolean
  averageRating: number
  reviewCount: number
  bookingCount: number
  instructions?: string
  autoApprove: boolean
  owner: {
    id: string
    name: string
    email: string
    avatar?: string
    phone?: string
    createdAt: string
  }
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    createdAt: string
    author: {
      id: string
      name: string
      avatar?: string
    }
  }>
  images: string[]
  createdAt: string
}

const amenityIcons = {
  COVERED: Shield,
  SECURITY_CAMERA: Camera,
  GATED: Shield,
  LIGHTING: Zap,
  EASY_ACCESS: Car,
  ELECTRIC_CHARGER: Zap,
}

const amenityLabels = {
  COVERED: 'Coberto',
  SECURITY_CAMERA: 'Câmera de Segurança',
  GATED: 'Portão',
  LIGHTING: 'Iluminação',
  EASY_ACCESS: 'Fácil Acesso',
  ELECTRIC_CHARGER: 'Carregador Elétrico',
}

const spaceTypeLabels = {
  RESIDENTIAL: 'Residencial',
  COMMERCIAL: 'Comercial',
  STREET: 'Rua',
  GARAGE: 'Garagem',
}

const vehicleTypeLabels = {
  CAR: 'Carro',
  MOTORCYCLE: 'Moto',
  VAN: 'Van',
  TRUCK: 'Caminhão',
}

export default function SpaceDetailsPage() {
  const params = useParams()
  const [space, setSpace] = useState<ParkingSpace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/spaces/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Vaga não encontrada')
            return
          }
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setSpace(data)
      } catch (error) {
        console.error('Erro ao buscar vaga:', error)
        setError(error instanceof Error ? error.message : 'Erro ao carregar vaga')
      } finally {
        setLoading(false)
      }
    }

    if (params.id && typeof params.id === 'string') {
      fetchSpace()
    } else {
      setError('ID da vaga inválido')
      setLoading(false)
    }
  }, [params.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vaga...</p>
        </div>
      </div>
    )
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-xl font-semibold mb-4">
              {error === 'Vaga não encontrada' ? 'Vaga não encontrada' : 'Erro ao carregar vaga'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error === 'Vaga não encontrada' 
                ? 'A vaga que você está procurando não existe ou foi removida.'
                : error || 'Ocorreu um erro ao carregar os detalhes da vaga.'
              }
            </p>
            <div className="space-y-3">
              <Link href="/spaces">
                <Button className="w-full">Ver Todas as Vagas</Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="w-full">Buscar Vagas</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/spaces">
              <Button variant="outline" size="sm">
                ← Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{space.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{space.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagens */}
            <Card>
              <CardContent className="p-0">
                {space.images && space.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {space.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`${space.title} - Imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Car className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre esta vaga</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{space.description}</p>
              </CardContent>
            </Card>

            {/* Amenidades */}
            <Card>
              <CardHeader>
                <CardTitle>Comodidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {space.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                    return (
                      <div key={amenity} className="flex items-center gap-3">
                        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
                        <span className="text-sm">{amenityLabels[amenity as keyof typeof amenityLabels]}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Instruções */}
            {space.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Instruções</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{space.instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Avaliações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Avaliações ({space.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {space.reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Ainda não há avaliações para esta vaga.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {space.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.author.avatar} />
                            <AvatarFallback>
                              {review.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.author.name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-500 ml-2">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preços e reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Preços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(space.pricePerHour)}
                  </div>
                  <div className="text-gray-600">por hora</div>
                </div>
                
                {space.pricePerDay && (
                  <div className="text-center">
                    <div className="text-xl font-semibold text-green-600">
                      {formatPrice(space.pricePerDay)}
                    </div>
                    <div className="text-gray-600">por dia</div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={space.isActive ? "default" : "secondary"}>
                      {space.isActive ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Aprovação:</span>
                    <span className="text-gray-600">
                      {space.autoApprove ? 'Automática' : 'Manual'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reservas:</span>
                    <span className="text-gray-600">{space.bookingCount}</span>
                  </div>
                </div>

                <Link href={`/spaces/${space.id}/book`}>
                  <Button className="w-full" size="lg" disabled={!space.isActive}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Informações da vaga */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de Espaço</label>
                  <p>{spaceTypeLabels[space.spaceType as keyof typeof spaceTypeLabels]}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Tipos de Veículo</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {space.vehicleTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {vehicleTypeLabels[type as keyof typeof vehicleTypeLabels]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Avaliação Média</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{space.averageRating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({space.reviewCount} avaliações)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proprietário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Proprietário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={space.owner.avatar} />
                    <AvatarFallback>
                      {space.owner.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{space.owner.name}</p>
                    <p className="text-sm text-gray-600">
                      Membro desde {formatDate(space.owner.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Favoritar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Avaliações */}
        <div className="mt-8">
          <SpaceReviews spaceId={space.id} />
        </div>
      </div>
    </div>
  )
}
