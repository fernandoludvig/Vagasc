'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ReviewCardProps {
  review: {
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
  showType?: boolean
}

export default function ReviewCard({ review, showType = true }: ReviewCardProps) {
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SPACE_REVIEW':
        return 'Vaga'
      case 'USER_REVIEW':
        return 'Proprietário'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SPACE_REVIEW':
        return 'bg-blue-100 text-blue-800'
      case 'USER_REVIEW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.author.avatar} />
              <AvatarFallback>
                {review.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{review.author.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {review.rating}/5
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {showType && (
              <Badge className={getTypeColor(review.type)}>
                {getTypeLabel(review.type)}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>
        
        {review.comment && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {review.comment}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
