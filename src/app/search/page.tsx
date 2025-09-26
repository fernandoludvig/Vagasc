'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { MapPin, Search, Filter, Star, Clock, Car, Shield } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { ParkingSpace, ParkingSpaceWithDetails, SpaceType, VehicleType, SpaceAmenity } from '@/types'
import ParkingSpacesMap from '@/components/maps/ParkingSpacesMap'

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<SpaceType | 'all'>('all')
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<VehicleType[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<SpaceAmenity[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [spaces, setSpaces] = useState<ParkingSpaceWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map')

  const vehicleTypeOptions = [
    { value: 'CAR', label: 'Carro' },
    { value: 'MOTORCYCLE', label: 'Moto' },
    { value: 'TRUCK', label: 'Caminhão' },
    { value: 'VAN', label: 'Van' },
    { value: 'BICYCLE', label: 'Bicicleta' },
  ]

  const amenityOptions = [
    { value: 'COVERED', label: 'Coberto' },
    { value: 'SECURITY_CAMERA', label: 'Câmera de Segurança' },
    { value: 'ELECTRIC_CHARGING', label: 'Carregador Elétrico' },
    { value: 'ACCESSIBLE', label: 'Acessível' },
    { value: 'LIGHTING', label: 'Iluminação' },
    { value: 'GATED', label: 'Portão' },
  ]

  const spaceTypeOptions = [
    { value: 'PRIVATE', label: 'Privado' },
    { value: 'COMMERCIAL', label: 'Comercial' },
    { value: 'RESIDENTIAL', label: 'Residencial' },
  ]

  const handleVehicleTypeChange = (vehicleType: VehicleType, checked: boolean) => {
    if (checked) {
      setSelectedVehicleTypes(prev => [...prev, vehicleType])
    } else {
      setSelectedVehicleTypes(prev => prev.filter(type => type !== vehicleType))
    }
  }

  const handleAmenityChange = (amenity: SpaceAmenity, checked: boolean) => {
    if (checked) {
      setSelectedAmenities(prev => [...prev, amenity])
    } else {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity))
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedVehicleTypes.length > 0) params.append('vehicleTypes', selectedVehicleTypes.join(','))
      if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','))
      if (priceRange.min) params.append('minPrice', priceRange.min)
      if (priceRange.max) params.append('maxPrice', priceRange.max)

      const response = await fetch(`/api/spaces/search?${params}`)
      const data = await response.json()
      console.log('Dados recebidos da API:', data)
      setSpaces(data.spaces || [])
    } catch (error) {
      console.error('Erro ao buscar vagas:', error)
      setSpaces([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReserve = (spaceId: string) => {
    router.push(`/spaces/${spaceId}/book`)
  }

  const handleViewDetails = (spaceId: string) => {
    router.push(`/spaces/${spaceId}`)
  }

  useEffect(() => {
    // Carregar todas as vagas por padrão
    const loadInitialSpaces = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/spaces/search')
        const data = await response.json()
        console.log('Dados recebidos da API:', data)
        setSpaces(data.spaces || [])
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
        setSpaces([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialSpaces()
  }, [])

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Buscar Vagas de Estacionamento</h1>
          <p className="text-muted-foreground">
            Encontre a vaga perfeita para seu veículo em Florianópolis
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Localização</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite o endereço..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Vaga</label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as SpaceType | 'all')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {spaceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Veículo</label>
                  <div className="space-y-2">
                    {vehicleTypeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={selectedVehicleTypes.includes(option.value as VehicleType)}
                          onCheckedChange={(checked) => 
                            handleVehicleTypeChange(option.value as VehicleType, checked as boolean)
                          }
                        />
                        <label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comodidades</label>
                  <div className="space-y-2">
                    {amenityOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={selectedAmenities.includes(option.value as SpaceAmenity)}
                          onCheckedChange={(checked) => 
                            handleAmenityChange(option.value as SpaceAmenity, checked as boolean)
                          }
                        />
                        <label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Faixa de Preço (R$/h)</label>
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

                <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {/* Controles de visualização */}
            {spaces.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {spaces.length} vaga{spaces.length !== 1 ? 's' : ''} encontrada{spaces.length !== 1 ? 's' : ''}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    Lista
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                  >
                    Mapa
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">Carregando vagas...</h3>
                    <p className="text-muted-foreground">
                      Buscando vagas disponíveis
                    </p>
                  </CardContent>
                </Card>
              ) : spaces.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma vaga encontrada</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros ou buscar em uma área diferente
                    </p>
                  </CardContent>
                </Card>
              ) : viewMode === 'map' ? (
                <ParkingSpacesMap
                  spaces={spaces}
                  height="600px"
                  className="rounded-lg border"
                />
              ) : (
                spaces.map((space) => (
                  <Card key={space.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold">{space.title}</h3>
                            <Badge variant="secondary">
                              {spaceTypeOptions.find(opt => opt.value === space.spaceType)?.label}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">{space.description}</p>
                          
                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            {space.address}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {space.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenityOptions.find(opt => opt.value === amenity)?.label}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                            <span className="mr-4">4.8 (24 avaliações)</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Disponível agora</span>
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <div className="text-right mb-4">
                            <div className="text-2xl font-bold text-primary">
                              R$ {Number(space.pricePerHour).toFixed(2)}/h
                            </div>
                            {space.pricePerDay && (
                              <div className="text-sm text-muted-foreground">
                                R$ {Number(space.pricePerDay).toFixed(2)}/dia
                              </div>
                            )}
                          </div>

                          <Button 
                            className="w-full mb-2"
                            onClick={() => handleReserve(space.id)}
                          >
                            <Car className="mr-2 h-4 w-4" />
                            Reservar
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleViewDetails(space.id)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
