// Configurações e utilitários para Google Maps

export const FLORIANOPOLIS_CENTER = {
  lat: -27.5954,
  lng: -48.5480
}

export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  zoom: 13,
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
}

// Função para criar marcador personalizado
export const createCustomMarker = (map: google.maps.Map, position: google.maps.LatLngLiteral, options: {
  title?: string
  icon?: string
  animation?: google.maps.Animation
}) => {
  return new google.maps.Marker({
    position,
    map,
    title: options.title,
    animation: options.animation || google.maps.Animation.DROP
  })
}

// Função para criar InfoWindow
export const createInfoWindow = (content: string, options?: google.maps.InfoWindowOptions) => {
  return new google.maps.InfoWindow({
    content,
    ...options
  })
}

// Função para geocodificar endereço
export const geocodeAddress = async (address: string): Promise<{
  lat: number
  lng: number
  address: string
} | null> => {
  if (!window.google?.maps) {
    throw new Error('Google Maps não está carregado')
  }

  const geocoder = new google.maps.Geocoder()
  
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

// Função para fazer reverse geocode
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  if (!window.google?.maps) {
    throw new Error('Google Maps não está carregado')
  }

  const geocoder = new google.maps.Geocoder()
  
  try {
    const results = await geocoder.geocode({ 
      location: { lat, lng } 
    })
    if (results.results.length > 0) {
      return results.results[0].formatted_address
    }
  } catch (error) {
    console.error('Erro ao fazer reverse geocode:', error)
  }
  
  return null
}

// Função para calcular distância entre dois pontos
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  if (!window.google?.maps) {
    // Fallback para cálculo manual
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const point1 = new google.maps.LatLng(lat1, lng1)
  const point2 = new google.maps.LatLng(lat2, lng2)
  return google.maps.geometry.spherical.computeDistanceBetween(point1, point2) / 1000 // Converter para km
}

// Função para obter localização do usuário
export const getUserLocation = (): Promise<{
  lat: number
  lng: number
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não é suportada por este navegador'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    )
  })
}

// Tipos de marcadores para diferentes tipos de vagas
export const MARKER_ICONS = {
  PRIVATE: {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 }
  },
  COMMERCIAL: {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">C</text>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 }
  },
  RESIDENTIAL: {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#F59E0B" stroke="#fff" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">R</text>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 16 }
  }
}

// Função para obter ícone do marcador baseado no tipo de vaga
export const getMarkerIcon = (spaceType: string) => {
  if (!window.google?.maps) {
    return undefined // Retorna undefined se Google Maps não estiver carregado
  }

  const iconConfig = MARKER_ICONS[spaceType as keyof typeof MARKER_ICONS] || MARKER_ICONS.PRIVATE
  
  return {
    url: iconConfig.url,
    scaledSize: new google.maps.Size(iconConfig.scaledSize.width, iconConfig.scaledSize.height),
    anchor: new google.maps.Point(iconConfig.anchor.x, iconConfig.anchor.y)
  }
}
