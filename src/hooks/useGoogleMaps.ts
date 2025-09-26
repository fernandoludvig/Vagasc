import { useEffect, useState, useCallback } from 'react'

// Declarar tipos globais necessários
declare global {
  interface Window {
    google: any
    gm_authFailure?: () => void
    initGoogleMap?: () => void
  }
}

interface UseGoogleMapsOptions {
  libraries?: string[]
  apiKey?: string
}

interface UseGoogleMapsReturn {
  isLoading: boolean
  error: string | null
  isLoaded: boolean
  loadScript: () => Promise<void>
}

export const useGoogleMaps = (options: UseGoogleMapsOptions = {}): UseGoogleMapsReturn => {
  const {
    libraries = ['places', 'geometry'],
    apiKey
  } = options

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadScript = useCallback(async () => {
    try {
      // Verificar se já está carregado
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
        setIsLoaded(true)
        setIsLoading(false)
        return
      }

      // Usar chave da API do environment ou fallback
      const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc'
      
      if (!finalApiKey) {
        throw new Error('Chave da API do Google Maps não configurada')
      }

      setIsLoading(true)
      setError(null)

      // Verificar se o script já existe
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        // Script já existe, aguardar carregamento
        const checkLoaded = () => {
          if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
            setIsLoaded(true)
            setIsLoading(false)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      // Configurar função global para erro de autenticação
      if (typeof window !== 'undefined') {
        window.gm_authFailure = () => {
        const errorDetails = (() => {
          const currentHost = window.location.host
          const currentUrl = window.location.href
          
          if (currentHost.includes('localhost:3001')) {
            return `🔑 ERRO: RefererNotAllowedMapError!\n\n🔧 SOLUÇÃO RÁPIDA:\n1. Acesse: https://console.cloud.google.com/apis/credentials\n2. Clique na sua chave de API\n3. Em "Restrições de sites", adicione EXATAMENTE:\n   • http://localhost:3001/*\n   • http://localhost:3000/*\n   • http://localhost:3001/search/*\n   • http://localhost:3001/test-referrer-error/*\n   • http://localhost:3001/test-maps/*\n4. Salve e aguarde 2-3 minutos\n5. Recarregue esta página\n\n🌐 URL atual: ${currentUrl}\n💡 Para testar: remova temporariamente todas as restrições de site`
          }
          
          return `🔑 ERRO: Configure a API do Google Maps no Google Cloud Console!\n\nVisite o Console em: ${currentUrl}\n\n1. https://console.cloud.google.com/apis/credentials\n2. Adicione o seu domínio nas restrições`
        })()
        
        setError(errorDetails)
        setIsLoading(false)
        }
      }

      // Criar uma promessa para aguardar carregamento
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(',')}` : ''
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${finalApiKey}${librariesParam}&callback=window.initGoogleMap&loading=async`
        script.async = true
        script.defer = true
        
        // Callback global que será chamado quando o script carregar
        if (typeof window !== 'undefined') {
          window.initGoogleMap = () => {
          // Verificação adicional antes de marcar como carregado
          if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
            setIsLoaded(true)
            setIsLoading(false)
            setError(null)
            resolve()
          } else {
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
                setIsLoaded(true)
                setIsLoading(false)
                setError(null)
                resolve()
              }
            }, 100)
          }
          }
        }
        
        script.onload = () => {
          // Verificar novamente quando o script carrega
          if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.Map) {
            setIsLoaded(true)
            setIsLoading(false)
            setError(null)
            resolve()
          }
        }
        
        script.onerror = (err) => {
          console.error('Erro ao carregar Google Maps script:', err)
          setError('Erro ao carregar Google Maps - Verifique sua conexão')
          setIsLoading(false)
          reject(new Error('Erro ao carregar script do Google Maps'))
        }
        
        document.head.appendChild(script)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar Google Maps'
      setError(errorMessage)
      setIsLoading(false)
      throw err
    }
  }, [apiKey, libraries])

  useEffect(() => {
    loadScript()
  }, [loadScript])

  return { isLoading, error, isLoaded, loadScript }
}
