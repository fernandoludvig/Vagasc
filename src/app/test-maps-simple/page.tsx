'use client'

import { useEffect, useRef, useState } from 'react'

// Declarar tipos globais necessários
declare global {
  interface Window {
    google: any
    gm_authFailure?: () => void
    initTestMap?: () => void
  }
}

export default function TestMapsSimplePage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Iniciando...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        setStatus('Carregando script do Google Maps...')
        
        // Verificar se já está carregado
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          setStatus('Google Maps já carregado')
          createMap()
          return
        }

        // Carregar script do Google Maps com chave fixa e fallback
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDKyyxv3ktBWZcmsk1GyyamnahmhwvcKSc'
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=window.initTestMap`
        script.async = true
        script.defer = true
        
        // Configurar callback global
        if (typeof window !== 'undefined') {
          window.initTestMap = () => {
            setStatus('Script carregado, criando mapa...')
            createMap()
          }
          
          // Configurar função para erros de autenticação
          window.gm_authFailure = function() {
            setError('Erro de autenticação - Verifique a chave da API')
            setStatus('Erro de API')
          }
        }
        
        script.onload = () => {
          setStatus('Script carregado, criando mapa...')
          createMap()
        }
        
        script.onerror = () => {
          setError('Erro ao carregar script do Google Maps')
          setStatus('Erro')
        }
        
        document.head.appendChild(script)
        
      } catch (err) {
        setError(`Erro: ${err}`)
        setStatus('Erro')
      }
    }

    const createMap = () => {
      if (!mapRef.current) {
        setError('Elemento do mapa não disponível')
        return
      }
      
      if (typeof window === 'undefined' || !window.google || !window.google.maps) {
        setError('Google Maps não carregado')
        return
      }

      try {
        setStatus('Criando mapa...')
        
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: -27.5954, lng: -48.5480 }, // Florianópolis
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        })

        // Adicionar marcador
        new window.google.maps.Marker({
          position: { lat: -27.5954, lng: -48.5480 },
          map: map,
          title: 'Florianópolis'
        })

        setStatus('Mapa criado com sucesso!')
        setError(null)
        
      } catch (err) {
        console.error('Erro ao criar mapa:', err)
        setError(`Erro ao criar mapa: ${err}`)
        setStatus('Erro')
      }
    }

    initMap()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Teste Simples do Google Maps</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="space-y-2">
          <div><strong>Status:</strong> {status}</div>
          {error && (
            <div className="text-red-600">
              <strong>Erro:</strong> {error}
            </div>
          )}
          <div><strong>Chave API:</strong> {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Configurada' : 'Não configurada'}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Mapa</h2>
        <div 
          ref={mapRef} 
          className="w-full h-96 bg-gray-100 rounded-lg border-2 border-gray-300"
          style={{ minHeight: '400px' }}
        >
          {status === 'Iniciando...' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Carregando mapa...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
