'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Upload, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import LocationSelector from '@/components/maps/LocationSelector'

const SPACE_TYPES = [
  { value: 'PRIVATE', label: 'Privada' },
  { value: 'COMMERCIAL', label: 'Comercial' },
  { value: 'RESIDENTIAL', label: 'Residencial' }
]

const VEHICLE_TYPES = [
  { value: 'CAR', label: 'Carro' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'VAN', label: 'Van' },
  { value: 'TRUCK', label: 'Caminhão' }
]

const AMENITIES = [
  { value: 'COVERED', label: 'Cobertura' },
  { value: 'SECURITY_CAMERA', label: 'Câmera de Segurança' },
  { value: 'ELECTRIC_CHARGING', label: 'Carregamento Elétrico' },
  { value: 'ACCESSIBLE', label: 'Acessível' },
  { value: 'LIGHTING', label: 'Iluminação' },
  { value: 'GATED', label: 'Portão' }
]

export default function CreateSpacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    pricePerHour: '',
    pricePerDay: '',
    spaceType: 'PRIVATE', // Valor padrão válido
    vehicleTypes: [] as string[],
    amenities: [] as string[],
    instructions: '',
    autoApprove: true,
    images: [] as string[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field: 'vehicleTypes' | 'amenities', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }))
  }

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address
    }))
    setShowLocationSelector(false)
    toast.success('Localização selecionada com sucesso!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.address || !formData.pricePerHour || !formData.spaceType) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (formData.vehicleTypes.length === 0) {
      toast.error('Selecione pelo menos um tipo de veículo')
      return
    }

    // Validar se os valores estão corretos
    const validSpaceTypes = ['PRIVATE', 'COMMERCIAL', 'RESIDENTIAL']
    if (!validSpaceTypes.includes(formData.spaceType)) {
      toast.error('Tipo de vaga inválido')
      return
    }

    const validAmenities = ['COVERED', 'SECURITY_CAMERA', 'ELECTRIC_CHARGING', 'ACCESSIBLE', 'LIGHTING', 'GATED']
    const invalidAmenities = formData.amenities.filter(amenity => !validAmenities.includes(amenity))
    if (invalidAmenities.length > 0) {
      toast.error(`Amenidades inválidas: ${invalidAmenities.join(', ')}`)
      return
    }

    try {
      setLoading(true)
      
      const requestData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        pricePerHour: parseFloat(formData.pricePerHour),
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : undefined,
        spaceType: formData.spaceType as 'PRIVATE' | 'COMMERCIAL' | 'RESIDENTIAL',
        vehicleTypes: formData.vehicleTypes as ('CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN')[],
        amenities: formData.amenities.filter(amenity => 
          ['COVERED', 'SECURITY_CAMERA', 'ELECTRIC_CHARGING', 'ACCESSIBLE', 'LIGHTING', 'GATED'].includes(amenity)
        ) as ('COVERED' | 'SECURITY_CAMERA' | 'ELECTRIC_CHARGING' | 'ACCESSIBLE' | 'LIGHTING' | 'GATED')[],
        instructions: formData.instructions,
        autoApprove: formData.autoApprove,
        latitude: formData.latitude || -27.5954, // Coordenadas de Florianópolis
        longitude: formData.longitude || -48.5480,
        images: formData.images.length > 0 ? formData.images : [], // Garantir que images seja array
      }

      console.log('FormData atual:', formData)
      console.log('SpaceType selecionado:', formData.spaceType)
      console.log('VehicleTypes selecionados:', formData.vehicleTypes)
      console.log('Amenities selecionadas:', formData.amenities)
      console.log('Enviando dados para criar vaga:', requestData)
      
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao criar vaga'
        
        console.error('Status da resposta:', response.status)
        console.error('Headers da resposta:', Object.fromEntries(response.headers.entries()))
        
        if (response.status === 401) {
          errorMessage = 'Você precisa estar logado para criar vagas'
        } else {
          try {
            const errorText = await response.text()
            console.error('Resposta da API (texto):', errorText)
            
            if (errorText) {
              try {
                const error = JSON.parse(errorText)
                console.error('Erro da API (JSON):', error)
                errorMessage = error.message || errorMessage
                
                // Se houver detalhes do erro de validação, mostrar
                if (error.details) {
                  console.error('Detalhes do erro:', error.details)
                }
              } catch {
                // Se não for JSON válido, usar o texto como mensagem
                errorMessage = errorText || errorMessage
              }
            } else {
              // Se não conseguir fazer parse do JSON, usar mensagem padrão baseada no status
              if (response.status === 404) {
                errorMessage = 'Recurso não encontrado'
              } else if (response.status === 400) {
                errorMessage = 'Dados inválidos para criar a vaga'
              } else if (response.status >= 500) {
                errorMessage = 'Erro interno do servidor'
              }
            }
          } catch (parseError) {
            console.error('Erro ao fazer parse da resposta:', parseError)
            // Usar mensagem padrão baseada no status
            if (response.status === 400) {
              errorMessage = 'Dados inválidos para criar a vaga'
            } else if (response.status === 401) {
              errorMessage = 'Você precisa estar logado para criar vagas'
            } else if (response.status >= 500) {
              errorMessage = 'Erro interno do servidor'
            }
          }
        }
        
        throw new Error(errorMessage)
      }

      const newSpace = await response.json()
      toast.success('Vaga criada com sucesso!')
      router.push('/user/spaces')
    } catch (error) {
      console.error('Erro ao criar vaga:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar vaga')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold mb-4">Login Necessário</h2>
            <p className="text-gray-600 mb-6">
              Você precisa estar logado para cadastrar vagas
            </p>
            <Button onClick={() => router.push('/login')}>
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/user/spaces">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastrar Nova Vaga</h1>
          <p className="text-gray-600">Preencha as informações da sua vaga de estacionamento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais da sua vaga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Vaga na Lagoa da Conceição"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva sua vaga..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Endereço *</Label>
                <div className="space-y-2">
                  {formData.address ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Localização selecionada:</p>
                          <p className="text-sm text-green-700">{formData.address}</p>
                          <p className="text-xs text-green-600 mt-1">
                            Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLocationSelector(true)}
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          Alterar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLocationSelector(true)}
                      className="w-full justify-start"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Selecionar Localização no Mapa
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preços */}
          <Card>
            <CardHeader>
              <CardTitle>Preços</CardTitle>
              <CardDescription>
                Defina os valores da sua vaga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pricePerHour">Preço por hora (R$) *</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerHour}
                  onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                  placeholder="8.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pricePerDay">Preço por dia (R$)</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerDay}
                  onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
                  placeholder="40.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tipo e Características */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo e Características</CardTitle>
              <CardDescription>
                Características da sua vaga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="spaceType">Tipo da vaga *</Label>
                <Select value={formData.spaceType} onValueChange={(value) => handleInputChange('spaceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPACE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipos de veículos aceitos *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {VEHICLE_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={formData.vehicleTypes.includes(type.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('vehicleTypes', type.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={type.value} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Comodidades</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.value}
                        checked={formData.amenities.includes(amenity.value)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('amenities', amenity.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={amenity.value} className="text-sm">
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
              <CardDescription>
                Orientações para os usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instructions">Instruções de acesso</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Ex: Vaga na frente da casa. Portão automático com controle remoto."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoApprove"
                  checked={formData.autoApprove}
                  onCheckedChange={(checked) => handleInputChange('autoApprove', checked)}
                />
                <Label htmlFor="autoApprove" className="text-sm">
                  Aprovação automática de reservas
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Cadastrar Vaga'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/user/spaces">Cancelar</Link>
            </Button>
          </div>
        </div>
      </form>

      {/* Modal do Seletor de Localização */}
      {showLocationSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Selecionar Localização da Vaga</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationSelector(false)}
                >
                  ✕
                </Button>
              </div>
              
              <LocationSelector
                onLocationSelect={handleLocationSelect}
                initialLocation={formData.address ? {
                  lat: formData.latitude,
                  lng: formData.longitude,
                  address: formData.address
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
