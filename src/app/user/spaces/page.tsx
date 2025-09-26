'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Clock, Star, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ParkingSpace {
  id: string
  title: string
  description: string
  address: string
  images: string[]
  pricePerHour: number
  pricePerDay?: number
  spaceType: string
  vehicleTypes: string[]
  amenities: string[]
  isActive: boolean
  averageRating: number
  reviewCount: number
  bookingCount: number
  createdAt: string
}

export default function UserSpacesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchUserSpaces()
    }
  }, [status, router])

  const fetchUserSpaces = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/spaces?includeStats=true')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar vagas')
      }
      
      const data = await response.json()
      setSpaces(data.spaces || [])
    } catch (error) {
      console.error('Erro ao buscar vagas:', error)
      toast.error('Erro ao carregar suas vagas')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) {
      return
    }

    try {
      const response = await fetch(`/api/spaces/${spaceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir vaga')
      }

      toast.success('Vaga excluída com sucesso!')
      fetchUserSpaces() // Recarregar a lista
    } catch (error) {
      console.error('Erro ao excluir vaga:', error)
      toast.error('Erro ao excluir vaga')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const getSpaceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      COVERED: 'Coberta',
      UNCOVERED: 'Descoberta',
      GARAGE: 'Garagem',
      STREET: 'Rua'
    }
    return types[type] || type
  }

  const getVehicleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CAR: 'Carro',
      MOTORCYCLE: 'Moto',
      VAN: 'Van',
      TRUCK: 'Caminhão'
    }
    return types[type] || type
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando suas vagas...</p>
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
              Você precisa estar logado para gerenciar suas vagas
            </p>
            <Button onClick={() => router.push('/login')}>
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Vagas</h1>
          <p className="text-gray-600">
            Gerencie suas vagas de estacionamento
          </p>
        </div>
        <Button asChild className="mt-4 sm:mt-0">
          <Link href="/user/spaces/create">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Nova Vaga
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vagas</p>
                <p className="text-2xl font-bold text-gray-900">{spaces.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spaces.filter(space => space.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spaces.length > 0 
                    ? (spaces.reduce((sum, space) => sum + (space.averageRating || 0), 0) / spaces.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spaces List */}
      {spaces.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma vaga cadastrada</h3>
            <p className="text-gray-600 mb-6">
              Comece cadastrando sua primeira vaga de estacionamento
            </p>
            <Button asChild>
              <Link href="/user/spaces/create">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeira Vaga
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <Card key={space.id} className="overflow-hidden">
              {space.images && space.images.length > 0 && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={space.images[0]}
                    alt={space.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{space.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {space.address}
                    </CardDescription>
                  </div>
                  <Badge variant={space.isActive ? "default" : "secondary"}>
                    {space.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Description */}
                  {space.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {space.description}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Por hora</p>
                      <p className="font-semibold">{formatPrice(space.pricePerHour)}</p>
                    </div>
                    {space.pricePerDay && (
                      <div>
                        <p className="text-sm text-gray-600">Por dia</p>
                        <p className="font-semibold">{formatPrice(space.pricePerDay)}</p>
                      </div>
                    )}
                  </div>

                  {/* Space Type */}
                  <div>
                    <Badge variant="outline">
                      {getSpaceTypeLabel(space.spaceType)}
                    </Badge>
                  </div>

                  {/* Vehicle Types */}
                  <div className="flex flex-wrap gap-1">
                    {space.vehicleTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {getVehicleTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {space.averageRating ? space.averageRating.toFixed(1) : '0.0'} ({space.reviewCount || 0})
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {space.bookingCount} reservas
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/spaces/${space.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/user/spaces/${space.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteSpace(space.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
