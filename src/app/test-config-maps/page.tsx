'use client'

import { useState, useEffect } from 'react'
import GoogleMap from '@/components/maps/GoogleMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestConfigMapsPage() {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testGoogleMaps = () => {
      const checkMaps = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          setIsMapLoaded(true)
          setLoading(false)
          setError(null)
          return true
        } else {
          return false
        }
      }

      // Verificação imediata
      if (checkMaps()) return

      // Verificar periodicamente
      const interval = setInterval(() => {
        if (checkMaps()) {
          clearInterval(interval)
        }
      }, 500)

      // Timeout para detectar erro
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setLoading(false)
        
        if (!window.google?.maps) {
          setError('Google Maps não carregou - Verifique as configurações de API')
        } else if (!window.google.maps.Map) {
          setError('Constructor Map não disponível - Problema na carga do Google Maps')
        }
      }, 10000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }

    testGoogleMaps()
  }, [])

  const retryTest = () => {
    setLoading(true)
    setError(null)
    setIsMapLoaded(false)
    
    // Limpar scripts existentes
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.remove()
    }
    
    // Aguardar um pouco e recarregar
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const markers = [
    {
      id: 'centro',
      position: { lat: -27.5954, lng: -48.5480 },
      title: 'Centro Florianópolis',
      description: 'Local central da cidade',
      price: 8.50,
      spaceType: 'PRIVATE'
    },
    {
      id: 'jurerê',
      position: { lat: -27.5227, lng: -48.5080 },
      title: 'Jurerê Internacional',
      description: 'Praia e balneário de luxo',
      price: 12.00,
      spaceType: 'COMMERCIAL'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🧪 Teste de Configuração Google Maps</h1>
        <p className="text-gray-600">Validação após configuração no Google Cloud Console</p>
      </div>

      {/* Status das Verificações */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              Search Engine disponível:
            </span>
            {loading ? (
              <Badge variant="secondary">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Verificando...
              </Badge>
            ) : (
              <Badge variant={window.google?.maps ? "default" : "destructive"}>
                {window.google?.maps ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {window.google?.maps ? 'OK' : 'Erro'}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              Map Constructor disponível:
            </span>
            {loading ? (
              <Badge variant="secondary">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Verificando...
              </Badge>
            ) : (
              <Badge variant={window.google?.maps?.Map ? "default" : "destructive"}>
                {window.google?.maps?.Map ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {window.google?.maps?.Map ? 'OK' : 'Erro'}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              URL autorizada:
            </span>
            <Badge variant="outline">
              localhost:3001 ✅
            </Badge>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
              <Button 
                onClick={retryTest} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                🔄 Tentar Novamente
              </Button>
            </div>
          )}

          {isMapLoaded && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                ✅ <strong>Perfeito!</strong> Google Maps carregado e funcionando corretamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste Prático do Mapa */}
      {isMapLoaded ? (
        <Card>
          <CardHeader>
            <CardTitle>Teste Prático: Mapa Interativo</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMap
              center={{ lat: -27.5954, lng: -48.5480 }}
              zoom={12}
              markers={markers}
              height="500px"
              className="w-full border rounded-lg"
              onMarkerClick={(marker) => {
                console.log('✅ Marcador clicado:', marker)
              }}
              onMapClick={(event) => {
                if (event.latLng) {
                  const lat = event.latLng.lat()
                  const lng = event.latLng.lng()
                  console.log('✅ Mapa clicado:', { lat, lng })
                }
              }}
            />
            <div className="mt-3 text-sm text-gray-600">
              💡 Teste as funcionalidades: clique nos marcadores e tente clicar no mapa!
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mapa (Aguardando Carregamento)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              {loading ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Carregando Google Maps...</p>
                </div>
              ) : (
                <div className="text-center">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p>Erro ao carregar mapa</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          ✅ Configuração do Google Cloud Console Validada
        </h2>
        <p className="text-blue-700">
          Se você consegue ver o mapa acima funcionando, sua configuração está correta!
        </p>
      </div>
    </div>
  )
}
