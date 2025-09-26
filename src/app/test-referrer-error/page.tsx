'use client'

import { useState, useEffect } from 'react'
import GoogleMap from '@/components/maps/GoogleMap'
import ParkingSpacesMap from '@/components/maps/ParkingSpacesMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

// Tipos de debug
interface RefererStatus {
  url: string
  status: 'pending' | 'success' | 'error' 
  timestamp: string
  error?: string
}

export default function TestReferrerErrorPage() {
  const [refererStatus, setRefererStatus] = useState<RefererStatus | null>(null)
  const [apiStatus, setApiStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const logMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    setDebugLogs(prev => [...prev, logEntry])
    console.log('[DEBUG]', message)
  }

  useEffect(() => {
    logMessage('Iniciando debug do referrer')
    
    const checkReferrer = () => {
      const currentUrl = window.location.href
      const currentHost = window.location.host
      
      logMessage(`URL atual: ${currentUrl}`)
      logMessage(`Host atual: ${currentHost}`)

      setRefererStatus({
        url: currentUrl,
        status: 'pending',
        timestamp: new Date().toLocaleTimeString()
      })

      // Simular teste de Google Maps
      setTimeout(() => {
        if (window.google && window.google.maps) {
          logMessage('Google Maps carregado com sucesso')
          setApiStatus('loaded')
          setRefererStatus(prev => prev ? { ...prev, status: 'success' } : null)
        } else {
          logMessage('Google Maps ainda carregando...')
        }
      }, 1000)

      // Timeout para simular erro
      setTimeout(() => {
        if (apiStatus === 'loading') {
          logMessage('Timeout atingido, provavelmente referrer não autorizado')
          setApiStatus('error')
          setRefererStatus(prev => prev ? { 
            ...prev, 
            status: 'error', 
            error: 'RefererNotAllowedMapError - Verifique as restrições no Google Cloud Console' 
          } : null)
        }
      }, 10000)
    }

    checkReferrer()
  }, [])

  const testDummySpaces = [
    {
      id: '1',
      title: 'Vaga de Teste - Centro',
      description: 'Vaga de teste para debug',
      address: 'Centro, Florianópolis - SC',
      latitude: -27.5954,
      longitude: -48.5480,
      pricePerHour: 8.50,
      spaceType: 'PRIVATE',
      vehicleTypes: ['CAR'],
      amenities: ['COVERED']
    }
  ]

  const resetTest = () => {
    setRefererStatus(null)
    setApiStatus('loading')
    setDebugLogs([])
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔧 Debug RefererNotAllowedMapError</h1>
        <p className="text-gray-600">Diagnóstico detalhado do erro no localhost:3001</p>
      </div>

      {/* Status do Referer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Status da URL Referer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {refererStatus ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">URL:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{refererStatus.url}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {refererStatus.status === 'pending' && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Verificando...
                    </Badge>
                  )}
                  {refererStatus.status === 'success' && (
                    <Badge variant="default">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Autorizada
                    </Badge>
                  )}
                  {refererStatus.status === 'error' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Erro
                    </Badge>
                  )}
                </div>
                {refererStatus.error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm">
                    {refererStatus.error}
                  </div>
                )}
              </>
            ) : (
              <span className="text-medium text-gray-600">Aguardando verificação...</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <div className="text-gray-400">Aguardando logs...</div>
            ) : (
              debugLogs.map((log, index) => <div key={index}>{log}</div>)
            )}
          </div>
          <Button 
            onClick={resetTest} 
            variant="outline" 
            className="mt-3"
            size="sm"
          >
            🔄 Reiniciar Teste
          </Button>
        </CardContent>
      </Card>

      {/* Teste Gradual dos Mapas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Teste componente básico */}
        <Card>
          <CardHeader>
            <CardTitle>Teste 1: GoogleMap Básico</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMap
              center={{ lat: -27.5954, lng: -48.5480 }}
              zoom={13}
              height="300px"
              className="rounded-lg border"
            />
          </CardContent>
        </Card>

        {/* Teste componente completo que causa erro */}
        <Card>
          <CardHeader>
            <CardTitle>Teste 2: ParkingSpacesMap Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <ParkingSpacesMap
              spaces={testDummySpaces}
              height="300px"
              className="rounded-lg border"
            />
          </CardContent>
        </Card>
      </div>

      {/* Instruções específicas */}
      {(apiStatus === 'error' || (refererStatus && refererStatus.status === 'error')) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Como Resolver o RefererNotAllowedMapError
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium text-red-800">📋 Passo a Passo:</p>
              <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                <li>Acesse <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-600 hover:underline">Google Cloud Console → Credenciais</a></li>
                <li>Clique na sua chave de API (chave usada: <code>AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc</code>)</li>
                <li>Em "Restrições de sites" (referer), certifique-se que tem:</li>
                <ul className="text-xs text-red-600 ml-4 space-y-1">
                  <li>✅ <code>http://localhost:3001/*</code></li>
                  <li>✅ <code>http://localhost:3000/*</code></li>
                  <li>✅ <code>http://localhost:3001/search/*</code></li>
                </ul>
                <li>Salve as alterações (pode levar até 5 minutos)</li>
                <li>Recarregue esta página</li>
              </ol>
            </div>
            <div className="bg-red-100 p-3 rounded border border-red-200 text-sm text-red-800">
              <strong>💡 Dica:</strong> Para um teste rápido, remova temporariamente TODAS as restrições de site (selecione "Não restringir a chave") e teste se funciona. Se funcionar, o problema é na configuração do referer.
            </div>
          </CardContent>
        </Card>
      )}

      {apiStatus === 'loaded' && (
        <Card className="border-green-200 bg-green-50">
          <CardTitle className="text-green-800 text-center pt-8">
            ✅ RefererNotAllowedMapError RESOLVIDO!
            <p className="text-sm text-green-700 mt-2">
              O mapa foi autorizado corretamente. O problema estava na configuração do Google Cloud Console.
            </p>
          </CardTitle>
        </Card>
      )}
    </div>
  )
}
