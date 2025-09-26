'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Users } from 'lucide-react'
import ReviewCard from './ReviewCard'

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

interface SpaceReviewsProps {
  spaceId: string
  showHeader?: boolean
  limit?: number
}

export default function SpaceReviews({ 
  spaceId, 
  showHeader = true, 
  limit = 5 
}: SpaceReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [spaceId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?spaceId=${spaceId}&type=SPACE_REVIEW&limit=${limit}`)
      
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  const displayedReviews = showAll ? reviews : reviews.slice(0, limit)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Avaliações
          </CardTitle>
          <CardDescription>
            Ainda não há avaliações para esta vaga
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Avaliações ({reviews.length})
              </CardTitle>
              <CardDescription>
                O que outros usuários pensam sobre esta vaga
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={averageRating} />
                <span className="text-lg font-semibold">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
              </p>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} showType={false} />
        ))}
        
        {reviews.length > limit && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Ver menos' : `Ver todas as ${reviews.length} avaliações`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
