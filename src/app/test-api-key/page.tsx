'use client'

import { useEffect, useState } from 'react'

export default function TestApiKeyPage() {
  const [status, setStatus] = useState('Testando...')
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    const testApiKey = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        setApiKey(key || 'NÃO CONFIGURADA')
        
        if (!key) {
          setError('Chave da API não configurada')
          setStatus('Erro')
          return
        }

        setStatus('Testando chave da API...')
        
        // Testar a chave da API fazendo uma requisição simples
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
        )
        
        if (response.ok) {
          setStatus('✅ Chave da API válida!')
          setError(null)
        } else {
          setError(`Erro HTTP: ${response.status} - ${response.statusText}`)
          setStatus('❌ Erro na chave da API')
        }
        
      } catch (err) {
        setError(`Erro: ${err}`)
        setStatus('❌ Erro de conexão')
      }
    }

    testApiKey()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Teste da Chave da API</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status do Teste</h2>
        
        <div className="space-y-3">
          <div>
            <strong>Chave da API:</strong>
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              apiKey === 'NÃO CONFIGURADA' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {apiKey === 'NÃO CONFIGURADA' ? 'NÃO CONFIGURADA' : `${apiKey.substring(0, 10)}...`}
            </span>
          </div>
          
          <div>
            <strong>Status:</strong>
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              status.includes('✅') ? 'bg-green-100 text-green-800' : 
              status.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {status}
            </span>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Erro:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Como Resolver o Erro RefererNotAllowedMapError</h2>
        
        <div className="space-y-4 text-blue-700">
          <div>
            <h3 className="font-semibold mb-2">1. Acesse o Google Cloud Console:</h3>
            <p>https://console.cloud.google.com/</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">2. Vá para APIs & Services → Credentials</h3>
            <p>Encontre sua chave da API e clique nela</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">3. Configure as restrições:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Application restrictions: <strong>HTTP referrers (web sites)</strong></li>
              <li>Website restrictions: Adicione estas URLs:</li>
            </ul>
            <div className="bg-white p-3 rounded border ml-4 mt-2 font-mono text-sm">
              http://localhost:3000/*<br/>
              https://localhost:3000/*<br/>
              http://127.0.0.1:3000/*<br/>
              https://127.0.0.1:3000/*
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">4. Salve e aguarde alguns minutos</h3>
            <p>As mudanças podem levar alguns minutos para serem aplicadas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
