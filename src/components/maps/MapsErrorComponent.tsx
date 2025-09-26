'use client'

import { AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface MapsErrorComponentProps {
  error: string
  className?: string
  height?: string
}

export function MapsErrorComponent({ error, className = '', height = '400px' }: MapsErrorComponentProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc')
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const openGoogleCloudConsole = () => {
    if (typeof window !== 'undefined') {
      window.open('https://console.cloud.google.com/apis/credentials', '_blank')
    }
  }

  const isRefererError = error.includes('RefererNotAllowedMapError') || error.includes('🔑 ERRO')
  
  // Detecta localhost:3001 - só executa no cliente
  const isLocalhostError = isClient && 
    typeof window !== 'undefined' && 
    window.location.hostname === 'localhost' && 
    window.location.port === '3001'

  if (isRefererError) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`} 
        style={{ height, minHeight: '300px' }}
      >
        <div className="text-center p-6 max-w-md">
          <AlertTriangle className="text-red-500 text-5xl mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {isLocalhostError ? 'RefererNotAllowedMapError em localhost:3001' : 'Configuração Necessária: Google Maps API'}
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {isLocalhostError 
              ? 'Detectamos que você está em localhost:3001 - o erro indica que esta URL não está autorizada'
              : 'Sua chave da API do Google Maps precisa ser configurada para permitir localhost'
            }
          </p>
          
          <div className="space-y-3 text-left">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Passo-a-passo para resolver:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li className="text-xs">Acesse o Google Cloud Console</li>
                <li className="text-xs">Vá em &quot;APIs e Serviços&quot; → &quot;Credenciais&quot;</li>
                <li className="text-xs">Clique na sua chave de API: <code className="bg-yellow-100 px-1 rounded text-xs">AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc</code></li>
                <li className="text-xs">Em &quot;Restrições de sites&quot;, adicione EXATAMENTE:</li>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0">
                  <li className="text-xs"><code className="bg-gray-100 px-1 rounded">http://localhost:3001/*</code></li>
                  <li className="text-xs"><code className="bg-gray-100 px-1 rounded">http://localhost:3000/*</code></li>
                  {isLocalhostError && (
                    <>
                      <li className="text-xs"><code className="bg-blue-100 px-1 rounded">http://localhost:3001/search/*</code></li>
                      <li className="text-xs"><code className="bg-blue-100 px-1 rounded">http://localhost:3001/test-referrer-error/*</code></li>
                      <li className="text-xs"><code className="bg-blue-100 px-1 rounded">http://localhost:3001/test-maps/*</code></li>
                    </>
                  )}
                </ul>
              </ol>
              {isLocalhostError && isClient && (
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mt-2 text-xs text-yellow-800">
                  🔧 <strong>Url atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'Carregando...'}<br/>
                  ✅ <strong>Garanta que &quot;http://localhost:3001/*&quot; inclui esta página!</strong><br/>
                  🔍 <strong>Se ainda não funcionar, adicione especificamente:</strong><br/>
                  <code className="bg-yellow-200 px-1 rounded">
                    {typeof window !== 'undefined' ? `${window.location.href}/*` : 'Carregando...'}
                  </code>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Button 
              onClick={openGoogleCloudConsole}
              className="w-full"
              variant="default"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Google Cloud Console
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={copyLink}
                variant="outline"
                className="flex-1 text-xs"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar API Key
                  </>
                )}
              </Button>
              <span className="text-xs text-gray-500">
                Use esta chave: AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            💡 <strong>Dica rápida:</strong> Remova temporariamente as restrições para testar!
          </p>
        </div>
      </div>
    )
  }

  {/* Componente de erro genérico para outros erros */}
  return (
    <div 
      className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`} 
      style={{ height }}
    >
      <div className="text-center p-4">
        <div className="text-red-500 text-4xl mb-2">🗺️</div>
        <h4 className="text-sm font-medium text-red-900 mb-1">Erro no Carregamento do Mapa</h4>
        <p className="text-xs text-red-600 mb-3">{error}</p>
        <Button 
          onClick={openGoogleCloudConsole}
          variant="outline"
          className="h-8 px-3 text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Verificar API
        </Button>
      </div>
    </div>
  )
}
