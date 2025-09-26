'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { MapsErrorComponent } from './MapsErrorComponent'

interface SimpleMapProps {
  center: {
    lat: number
    lng: number
  }
  zoom?: number
  onMapClick?: (event: google.maps.MapMouseEvent) => void
  className?: string
  height?: string
}

export default function SimpleMap({
  center,
  zoom = 13,
  onMapClick,
  className = '',
  height = '400px'
}: SimpleMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Usar hook personalizado para carregar Google Maps
  const { isLoading, error, isLoaded } = useGoogleMaps({
    libraries: ['places']
  })

  // Criar mapa quando Google Maps estiver carregado
  const initializeMap = useCallback(async () => {
    if (!isLoaded || !mapContainerRef.current) return

    // Verificar se Google Maps está realmente disponível
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      console.warn('Google Maps ainda não está disponível no SimpleMap')
      return
    }

    try {
      const mapInstance = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      if (onMapClick) {
        mapInstance.addListener('click', onMapClick)
      }

      setMap(mapInstance)
      setIsMapReady(true)
      
    } catch (err) {
      console.error('Erro ao inicializar mapa:', err)
    }
  }, [isLoaded, center, zoom, onMapClick])

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

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
      <div 
        ref={mapContainerRef}
        style={{ height }} 
        className="w-full rounded-lg shadow-lg"
      />
      
      {isMapReady && (
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
          className="absolute top-4 right-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-2 shadow-md transition-colors z-10"
          title="Minha localização"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  )
}