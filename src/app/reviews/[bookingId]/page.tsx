'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin, Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Booking {
  id: string
  startDateTime: string
  endDateTime: string
  totalAmount: number
  status: string
  space: {
    id: string
    title: string
    address: string
    images: string[]
  }
}

interface Review {
  id: string
  rating: number
  comment?: string
  type: 'SPACE_REVIEW' | 'USER_REVIEW'
  createdAt: string
  author: {
    id: string
    name: string
    avatar?: string
  }
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [existingReviews, setExistingReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [spaceReview, setSpaceReview] = useState({
    rating: 0,
    comment: ''
  })
  
  const [userReview, setUserReview] = useState({
    rating: 0,
    comment: ''
  })

  useEffect(() => {
    fetchBookingData()
  }, [bookingId])

  const fetchBookingData = async () => {
    try {
      const response = await fetch(`/api/reviews/booking/${bookingId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da reserva')
      }

      const data = await response.json()
      setBooking(data.booking)
      setExistingReviews(data.reviews)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados da reserva')
      router.push('/bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async (type: 'SPACE_REVIEW' | 'USER_REVIEW') => {
    const reviewData = type === 'SPACE_REVIEW' ? spaceReview : userReview
    
    if (reviewData.rating === 0) {
      toast.error('Por favor, selecione uma nota')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          rating: reviewData.rating,
          comment: reviewData.comment || undefined,
          type
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao enviar avaliação')
      }

      toast.success('Avaliação enviada com sucesso!')
      
      // Atualizar a lista de avaliações
      await fetchBookingData()
      
      // Limpar o formulário
      if (type === 'SPACE_REVIEW') {
        setSpaceReview({ rating: 0, comment: '' })
      } else {
        setUserReview({ rating: 0, comment: '' })
      }

    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    disabled = false 
  }: { 
    rating: number
    onRatingChange: (rating: number) => void
    disabled?: boolean
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          className={`text-2xl transition-colors ${
            star <= rating
              ? 'text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          ★
        </button>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Reserva não encontrada
          </h1>
          <Button onClick={() => router.push('/bookings')}>
            Voltar às Reservas
          </Button>
        </div>
      </div>
    )
  }

  const hasSpaceReview = existingReviews.some(review => review.type === 'SPACE_REVIEW')
  const hasUserReview = existingReviews.some(review => review.type === 'USER_REVIEW')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/bookings')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Avaliar Reserva</h1>
            <p className="text-muted-foreground">
              Compartilhe sua experiência com a comunidade
            </p>
          </div>
        </div>

        {/* Detalhes da Reserva */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalhes da Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{booking.space.title}</h3>
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {booking.space.address}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.startDateTime), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(new Date(booking.startDateTime), 'HH:mm', { locale: ptBR })} - {' '}
                    {format(new Date(booking.endDateTime), 'HH:mm', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-primary">
                    R$ {Number(booking.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avaliação da Vaga */}
        {!hasSpaceReview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Avaliar a Vaga
              </CardTitle>
              <CardDescription>
                Como foi sua experiência com esta vaga de estacionamento?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Avaliação *
                </label>
                <StarRating
                  rating={spaceReview.rating}
                  onRatingChange={(rating) => setSpaceReview(prev => ({ ...prev, rating }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentário (opcional)
                </label>
                <Textarea
                  placeholder="Compartilhe detalhes sobre sua experiência..."
                  value={spaceReview.comment}
                  onChange={(e) => setSpaceReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <Button
                onClick={() => handleSubmitReview('SPACE_REVIEW')}
                disabled={isSubmitting || spaceReview.rating === 0}
                className="w-full"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação da Vaga'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Avaliação do Proprietário */}
        {!hasUserReview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Avaliar o Proprietário
              </CardTitle>
              <CardDescription>
                Como foi sua experiência com o proprietário da vaga?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Avaliação *
                </label>
                <StarRating
                  rating={userReview.rating}
                  onRatingChange={(rating) => setUserReview(prev => ({ ...prev, rating }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentário (opcional)
                </label>
                <Textarea
                  placeholder="Compartilhe sua experiência com o proprietário..."
                  value={userReview.comment}
                  onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <Button
                onClick={() => handleSubmitReview('USER_REVIEW')}
                disabled={isSubmitting || userReview.rating === 0}
                variant="outline"
                className="w-full"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação do Proprietário'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Avaliações Existentes */}
        {existingReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Suas Avaliações</CardTitle>
              <CardDescription>
                Avaliações que você já enviou para esta reserva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.author.avatar} />
                        <AvatarFallback>
                          {review.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.author.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.type === 'SPACE_REVIEW' ? 'Avaliação da Vaga' : 'Avaliação do Proprietário'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating
                      rating={review.rating}
                      onRatingChange={() => {}}
                      disabled={true}
                    />
                    <span className="text-sm text-muted-foreground">
                      {review.rating}/5
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Ações Finais */}
        {(hasSpaceReview && hasUserReview) && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Avaliações Concluídas!
              </h3>
              <p className="text-muted-foreground mb-4">
                Obrigado por compartilhar sua experiência. Suas avaliações ajudam outros usuários.
              </p>
              <Button onClick={() => router.push('/bookings')}>
                Voltar às Reservas
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
