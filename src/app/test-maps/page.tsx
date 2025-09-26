'use client'

import { useState, useEffect, useRef } from 'react'
import GoogleMap from '@/components/maps/GoogleMap'
import SimpleMap from '@/components/maps/SimpleMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

declare global {
  interface Window {
    google: any
    gm_authFailure?: () => void
  }
}

export default function TestMapsPage() {
  // Forçar renderização apenas no cliente
  const [isClient, setIsClient] = useState(false)
  const [status, setStatus] = useState('Iniciando...')
  const [demoMaps] = useState([
    { id: '1', lat: -27.5954, lng: -48.5480, title: 'Centro', description: 'Centro de Florianópolis' },
    { id: '2', lat: -27.5804, lng: -48.5160, title: 'Lagoa', description: 'Região da Lagoa' },
    { id: '3', lat: -27.5227, lng: -48.5080, title: 'Jurerê', description: 'Jurerê Internacional' }
  ])
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (!isClient) return
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setStatus('✅ Google Maps carregado com sucesso!')
      } else {
        setStatus('⏳ Aguardando carregamento do Google Maps...')
      }
    }
    
    // Verificar imediatamente
    checkGoogleMaps()
    
    // Verificar a cada segunda até carregar
    const interval = setInterval(() => {
      checkGoogleMaps()
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        clearInterval(interval)
      }
    }, 1000)
    
    // Cleanup após 10 segundos
    setTimeout(() => clearInterval(interval), 10000)
    
    return () => clearInterval(interval)
  }, [isClient])
  
  if (!isClient) {
    return <div>Carregando...</div>
  }

  const markers = demoMaps.map(place => ({
    id: place.id,
    position: { lat: place.lat, lng: place.lng },
    title: place.title,
    description: place.description,
    price: Math.random() * 20 + 5, // Preço aleatório entre R$ 5-25
    spaceType: 'PRIVATE'
  }))

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🗺️ Teste Google Maps - VagaSC</h1>
        <p className="text-gray-600">Testes abrangentes do Google Maps no projeto</p>
      </div>

      {/* Status de API */}
      <Card>
        <CardHeader>
          <CardTitle>Status da API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={window.google?.maps ? "default" : "secondary"}>
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Chave API:</span>
              <Badge variant="outline">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Configurada' : 'Usando fallback'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Google Maps:</span>
              <Badge variant={window.google?.maps ? "default" : "destructive"}>
                {window.google?.maps ? 'Disponível' : 'Carregando...'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste com GoogleMap Component */}
      <Card>
        <CardHeader>
          <CardTitle>Teste 1: Componente GoogleMap (Com Marcadores)</CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleMap
            center={{ lat: -27.5954, lng: -48.5480 }}
            zoom={12}
            markers={markers}
            height="400px"
            className="w-full"
            onMarkerClick={(marker) => {
              console.log('Marcador clicado:', marker)
            }}
          />
        </CardContent>
      </Card>

      {/* Teste com SimpleMap Component */}
      <Card>
        <CardHeader>
          <CardTitle>Teste 2: Componente SimpleMap</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleMap
            center={{ lat: -27.5954, lng: -48.5480 }}
            zoom={13}
            height="300px"
            className="w-full"
            onMapClick={(event) => {
              if (event.latLng) {
                const lat = event.latLng.lat()
                const lng = event.latLng.lng()
                console.log('Mapa clicado:', { lat, lng })
              }
            }}
          />
        </CardContent>
      </Card>

      <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          ✅ Configuração Completa para Google Maps
        </h2>
        <p className="text-blue-700">
          Todos os componentes de mapa foram atualizados com a solução robusta.
          Se o mapa não carregar, verifique se a chave API está autorizada para localhost.
        </p>
      </div>
    </div>
  )
}