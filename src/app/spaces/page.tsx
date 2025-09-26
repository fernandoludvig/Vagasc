'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Star, Clock, Car, Shield, Wifi, Camera, Zap } from 'lucide-react'
import Link from 'next/link'

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
  distance?: number
  owner: {
    id: string
    name: string
    avatar?: string
  }
  images: string[]
  createdAt: string
}

interface SpacesResponse {
  spaces: ParkingSpace[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const amenityIcons = {
  COVERED: Shield,
  SECURITY_CAMERA: Camera,
  GATED: Shield,
  LIGHTING: Zap,
  EASY_ACCESS: Car,
  ELECTRIC_CHARGER: Zap,
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

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedVehicleType, setSelectedVehicleType] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchQuery) params.append('query', searchQuery)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedVehicleType !== 'all') params.append('vehicleTypes', selectedVehicleType)
      if (priceRange.min) params.append('minPrice', priceRange.min)
      if (priceRange.max) params.append('maxPrice', priceRange.max)

      const response = await fetch(`/api/spaces/search?${params}`)
      const data: SpacesResponse = await response.json()

      setSpaces(data.spaces)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Erro ao buscar vagas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpaces()
  }, [currentPage, searchQuery, selectedType, selectedVehicleType, priceRange])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchSpaces()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const formatDistance = (distance?: number) => {
    if (!distance) return null
    return `${distance.toFixed(1)} km`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vagas de Estacionamento
          </h1>
          <p className="text-gray-600">
            Encontre a vaga perfeita para seu veículo em Florianópolis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Busca por texto */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Buscar
                  </label>
                  <Input
                    placeholder="Título, endereço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                {/* Tipo de espaço */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tipo de Espaço
                  </label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="RESIDENTIAL">Residencial</SelectItem>
                      <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                      <SelectItem value="STREET">Rua</SelectItem>
                      <SelectItem value="GARAGE">Garagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de veículo */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tipo de Veículo
                  </label>
                  <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="CAR">Carro</SelectItem>
                      <SelectItem value="MOTORCYCLE">Moto</SelectItem>
                      <SelectItem value="VAN">Van</SelectItem>
                      <SelectItem value="TRUCK">Caminhão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Faixa de preço */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Preço por Hora
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Mín"
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Máx"
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSearch} className="w-full">
                  Aplicar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de vagas */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : spaces.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Nenhuma vaga encontrada com os filtros aplicados.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600">
                    {pagination.total} vagas encontradas
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {spaces.map((space) => (
                    <Card key={space.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Imagem */}
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                        {space.images && space.images.length > 0 ? (
                          <img
                            src={space.images[0]}
                            alt={space.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant="secondary" className="bg-white/90">
                            {spaceTypeLabels[space.spaceType as keyof typeof spaceTypeLabels]}
                          </Badge>
                          {space.distance && (
                            <Badge variant="secondary" className="bg-white/90">
                              {formatDistance(space.distance)}
                            </Badge>
                          )}
                        </div>

                        {/* Rating */}
                        {space.averageRating > 0 && (
                          <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{space.averageRating}</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <CardTitle className="text-lg mb-2 line-clamp-1">
                          {space.title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-1 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm line-clamp-1">{space.address}</span>
                        </div>

                        <CardDescription className="mb-4 line-clamp-2">
                          {space.description}
                        </CardDescription>

                        {/* Amenidades */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {space.amenities.slice(0, 3).map((amenity) => {
                            const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                            return Icon ? (
                              <div key={amenity} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                                <Icon className="w-3 h-3" />
                                <span className="text-xs">{amenity.replace('_', ' ')}</span>
                              </div>
                            ) : null
                          })}
                          {space.amenities.length > 3 && (
                            <div className="bg-gray-100 rounded-full px-2 py-1">
                              <span className="text-xs">+{space.amenities.length - 3}</span>
                            </div>
                          )}
                        </div>

                        {/* Tipos de veículo */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {space.vehicleTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {vehicleTypeLabels[type as keyof typeof vehicleTypeLabels]}
                            </Badge>
                          ))}
                        </div>

                        {/* Preço e ação */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatPrice(space.pricePerHour)}/h
                            </div>
                            {space.pricePerDay && (
                              <div className="text-sm text-gray-600">
                                {formatPrice(space.pricePerDay)}/dia
                              </div>
                            )}
                          </div>
                          
                          <Link href={`/spaces/${space.id}`}>
                            <Button>Ver Detalhes</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-10"
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
