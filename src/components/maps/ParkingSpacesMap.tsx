'use client'

import { useState, useEffect } from 'react'
import GoogleMap from './GoogleMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ParkingSpaceWithDetails } from '@/types'

interface ParkingSpacesMapProps {
  spaces: ParkingSpaceWithDetails[]
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  height?: string
  onSpaceSelect?: (space: ParkingSpaceWithDetails) => void
}

export default function ParkingSpacesMap({
  spaces,
  center = { lat: -27.5954, lng: -48.5480 }, // Florianópolis
  zoom = 12,
  className = '',
  height = '500px',
  onSpaceSelect
}: ParkingSpacesMapProps) {
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpaceWithDetails | null>(null)
  const [mapCenter, setMapCenter] = useState(center)

  // Converter espaços para marcadores
  const markers = spaces.map(space => ({
    id: space.id,
    position: { lat: space.latitude, lng: space.longitude },
    title: space.title,
    description: space.description || undefined,
    price: Number(space.pricePerHour),
    spaceType: space.spaceType,
    averageRating: undefined, // TODO: Implementar quando campos estiverem no schema
    reviewCount: undefined // TODO: Implementar quando campos estiverem no schema
  }))

  // Centralizar mapa na primeira vaga se não houver centro definido
  useEffect(() => {
    if (spaces.length > 0 && !center) {
      const firstSpace = spaces[0]
      setMapCenter({
        lat: firstSpace.latitude,
        lng: firstSpace.longitude
      })
    }
  }, [spaces, center])

  const handleMarkerClick = (marker: any) => {
    const space = spaces.find(s => s.id === marker.id)
    if (space) {
      setSelectedSpace(space)
      if (onSpaceSelect) {
        onSpaceSelect(space)
      }
    }
  }

  const getSpaceTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      PRIVATE: 'Privada',
      COMMERCIAL: 'Comercial',
      RESIDENTIAL: 'Residencial'
    }
    return types[type] || type
  }

  const getVehicleTypeLabels = (types: string[]) => {
    const typeLabels: { [key: string]: string } = {
      CAR: 'Carro',
      MOTORCYCLE: 'Moto',
      VAN: 'Van',
      TRUCK: 'Caminhão',
      BICYCLE: 'Bicicleta'
    }
    return types.map(type => typeLabels[type] || type).join(', ')
  }

  const getAmenityLabels = (amenities: string[]) => {
    const amenityLabels: { [key: string]: string } = {
      COVERED: 'Cobertura',
      SECURITY_CAMERA: 'Câmera',
      ELECTRIC_CHARGING: 'Carregamento',
      ACCESSIBLE: 'Acessível',
      LIGHTING: 'Iluminação',
      GATED: 'Portão'
    }
    return amenities.map(amenity => amenityLabels[amenity] || amenity)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mapa */}
      <div className="relative">
        <GoogleMap
          center={mapCenter}
          zoom={zoom}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          height={height}
          className="rounded-lg shadow-lg"
        />
        
        {/* Contador de vagas */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {spaces.length} vaga{spaces.length !== 1 ? 's' : ''} encontrada{spaces.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Painel de detalhes da vaga selecionada */}
      {selectedSpace && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{selectedSpace.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getSpaceTypeLabel(selectedSpace.spaceType)}
                  </Badge>
                  {/* TODO: Implementar quando campos estiverem no schema */}
                  {/* {selectedSpace.averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">
                        {selectedSpace.averageRating.toFixed(1)}
                        {selectedSpace.reviewCount && ` (${selectedSpace.reviewCount})`}
                      </span>
                    </div>
                  )} */}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSpace(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Endereço */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-700">{selectedSpace.address}</p>
            </div>

            {/* Preços */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  R$ {Number(selectedSpace.pricePerHour)}/hora
                </span>
              </div>
              {selectedSpace.pricePerDay && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    R$ {Number(selectedSpace.pricePerDay)}/dia
                  </span>
                </div>
              )}
            </div>

            {/* Tipos de veículos */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Tipos de veículos aceitos:</p>
              <p className="text-sm text-gray-700">{getVehicleTypeLabels(selectedSpace.vehicleTypes)}</p>
            </div>

            {/* Comodidades */}
            {selectedSpace.amenities.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Comodidades:</p>
                <div className="flex flex-wrap gap-1">
                  {getAmenityLabels(selectedSpace.amenities).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            {selectedSpace.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Descrição:</p>
                <p className="text-sm text-gray-700">{selectedSpace.description}</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href={`/spaces/${selectedSpace.id}`}>
                  Ver Detalhes
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/spaces/${selectedSpace.id}/book`}>
                  Reservar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de vagas se nenhuma estiver selecionada */}
      {!selectedSpace && spaces.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Vagas próximas:</h3>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {spaces.slice(0, 5).map((space) => (
              <Card 
                key={space.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedSpace(space)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{space.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{space.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-green-600">
                          R$ {Number(space.pricePerHour)}/h
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {getSpaceTypeLabel(space.spaceType)}
                        </Badge>
                      </div>
                    </div>
                    {/* TODO: Implementar quando campos estiverem no schema */}
                    {/* {space.averageRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">
                          {space.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )} */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
