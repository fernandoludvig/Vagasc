'use client'

import { useState, useEffect, useCallback } from 'react'
import SimpleMap from './SimpleMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search } from 'lucide-react'

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number; address?: string }
  className?: string
}

export default function LocationSelector({
  onLocationSelect,
  initialLocation,
  className = ''
}: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    address: string
  }>({
    lat: initialLocation?.lat || -27.5954, // Florianópolis
    lng: initialLocation?.lng || -48.5480,
    address: initialLocation?.address || ''
  })
  const [searchAddress, setSearchAddress] = useState(initialLocation?.address || '')
  const [isSearching, setIsSearching] = useState(false)

  // Função para geocodificar endereço
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return

    setIsSearching(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc'
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const location = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address
        }
        setSelectedLocation(location)
        setSearchAddress(location.address)
      }
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Função para fazer reverse geocode
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc'
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address
        setSearchAddress(address)
        setSelectedLocation(prev => ({ ...prev, address }))
      }
    } catch (error) {
      console.error('Erro ao fazer reverse geocode:', error)
    }
  }

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      const newLocation = { lat, lng, address: '' }
      setSelectedLocation(newLocation)
      reverseGeocode(lat, lng)
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    geocodeAddress(searchAddress)
  }

  const handleConfirmLocation = useCallback(() => {
    onLocationSelect(selectedLocation)
  }, [selectedLocation, onLocationSelect])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Busca por endereço */}
      <div className="space-y-2">
        <Label htmlFor="address-search">Buscar endereço</Label>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            id="address-search"
            type="text"
            placeholder="Digite o endereço da vaga..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching || !searchAddress.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Mapa */}
      <div className="space-y-2">
        <Label>Selecione a localização no mapa</Label>
        <SimpleMap
          center={selectedLocation}
          zoom={15}
          onMapClick={handleMapClick}
          height="400px"
          className="border rounded-lg"
        />
        <p className="text-sm text-gray-600">
          Clique no mapa para selecionar a localização exata da vaga
        </p>
      </div>

      {/* Informações da localização selecionada */}
      {selectedLocation.address && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Localização selecionada:</h4>
              <p className="text-sm text-blue-700 mt-1">{selectedLocation.address}</p>
              <p className="text-xs text-blue-600 mt-1">
                Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botão de confirmação */}
      <Button 
        onClick={handleConfirmLocation} 
        disabled={!selectedLocation.address}
        className="w-full"
      >
        <MapPin className="h-4 w-4 mr-2" />
        Confirmar Localização
      </Button>
    </div>
  )
}
