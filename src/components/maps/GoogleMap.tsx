'use client'

import { useEffect, useRef, useState } from 'react'
import { DEFAULT_MAP_OPTIONS, getMarkerIcon } from '@/lib/maps'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { MapsErrorComponent } from './MapsErrorComponent'

interface GoogleMapProps {
  center: {
    lat: number
    lng: number
  }
  zoom?: number
  markers?: Array<{
    id: string
    position: { lat: number; lng: number }
    title?: string
    description?: string
    price?: number
    spaceType?: string
  }>
  onMarkerClick?: (marker: any) => void
  onMapClick?: (event: google.maps.MapMouseEvent) => void
  className?: string
  height?: string
  showSearchBox?: boolean
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
}

export default function GoogleMap({
  center,
  zoom = 13,
  markers = [],
  onMarkerClick,
  onMapClick,
  className = '',
  height = '400px',
  showSearchBox = false,
  onLocationSelect
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null)
  const [searchInput, setSearchInput] = useState<HTMLInputElement | null>(null)
  const mapMarkersRef = useRef<google.maps.Marker[]>([])

  // Usar hook personalizado para carregar Google Maps
  const { isLoading, error, isLoaded } = useGoogleMaps({
    libraries: ['places', 'geometry']
  })

  // Criar mapa quando Google Maps estiver carregado
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    // Verificação adicional antes de criar o mapa
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.Map) {
      console.warn('Google Maps ainda não está disponível')
      return
    }

    try {
      const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom,
        ...DEFAULT_MAP_OPTIONS
      })

      const geocoderInstance = new (window as any).google.maps.Geocoder()
      setGeocoder(geocoderInstance)
      setMap(mapInstance)
    } catch (err) {
      console.error('Erro ao criar mapa:', err)
    }
  }, [isLoaded, center, zoom])

  // Configurar SearchBox se solicitado
  useEffect(() => {
    if (!map || !showSearchBox || !onLocationSelect) return

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Digite um endereço...'
    input.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
    
    const searchBoxInstance = new (window as any).google.maps.places.SearchBox(input)
    setSearchBox(searchBoxInstance)
    setSearchInput(input)

    // Adicionar o input ao mapa
    map.controls[(window as any).google.maps.ControlPosition.TOP_LEFT].push(input)

    // Event listener para seleção de lugar
    searchBoxInstance.addListener('places_changed', () => {
      const places = searchBoxInstance.getPlaces()
      if (places && places.length > 0) {
        const place = places[0]
        if (place.geometry && place.geometry.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || ''
          }
          onLocationSelect(location)
          
          // Centralizar o mapa na localização selecionada
          map.setCenter(location)
          map.setZoom(15)
        }
      }
    })

    return () => {
      if (searchInput && searchInput.parentNode) {
        searchInput.parentNode.removeChild(searchInput)
      }
    }
  }, [map, showSearchBox, onLocationSelect])

  // Event listener para clique no mapa
  useEffect(() => {
    if (!map || !onMapClick) return
    map.addListener('click', onMapClick)
  }, [map, onMapClick])

  // Atualizar marcadores quando markers mudar
  useEffect(() => {
    if (!map) return

    // Limpar marcadores existentes
    mapMarkersRef.current.forEach(marker => marker.setMap(null))
    mapMarkersRef.current = []

    // Adicionar novos marcadores
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        animation: window.google.maps.Animation.DROP,
        icon: markerData.spaceType ? getMarkerIcon(markerData.spaceType) : undefined
      })

      // InfoWindow para mostrar detalhes
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-lg">${markerData.title || 'Vaga de Estacionamento'}</h3>
            ${markerData.description ? `<p class="text-sm text-gray-600 mt-1">${markerData.description}</p>` : ''}
            ${markerData.price ? `<p class="text-sm font-medium text-green-600 mt-1">R$ ${markerData.price}/hora</p>` : ''}
            ${markerData.spaceType ? `<p class="text-xs text-blue-600 mt-1">${markerData.spaceType}</p>` : ''}
          </div>
        `
      })

      // Event listener para clique no marcador
      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        if (onMarkerClick) {
          onMarkerClick(markerData)
        }
      })

      mapMarkersRef.current.push(marker)
    })
  }, [map, markers, onMarkerClick])

  // Função para geocodificar endereço
  const geocodeAddress = async (address: string) => {
    if (!geocoder) return null

    try {
      const results = await geocoder.geocode({ address })
      if (results.results.length > 0) {
        const location = results.results[0].geometry.location
        return {
          lat: location.lat(),
          lng: location.lng(),
          address: results.results[0].formatted_address
        }
      }
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error)
    }
    return null
  }

  // Função para obter endereço de coordenadas
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoder) return null

    try {
      const results = await geocoder.geocode({ location: { lat, lng } })
      if (results.results.length > 0) {
        return results.results[0].formatted_address
      }
    } catch (error) {
      console.error('Erro ao fazer reverse geocode:', error)
    }
    return null
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <MapsErrorComponent error={error} className={className} height={height} />
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} style={{ height }} className="w-full rounded-lg shadow-lg" />
      
      {/* Botão para centralizar no usuário */}
      <button
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }
                map?.setCenter(userLocation)
                map?.setZoom(15)
              },
              (error) => {
                console.error('Erro ao obter localização:', error)
              }
            )
          }
        }}
        className="absolute top-4 right-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-2 shadow-md transition-colors"
        title="Minha localização"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  )
}

// Hook para usar o mapa
export const useGoogleMap = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true)
      } else {
        setTimeout(checkGoogleMaps, 100)
      }
    }
    checkGoogleMaps()
  }, [])

  return { isLoaded }
}