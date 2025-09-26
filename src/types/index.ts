import { User, ParkingSpace, Booking, Review, UserRole, SpaceType, VehicleType, SpaceAmenity, BookingStatus, PaymentStatus, ReviewType } from '@prisma/client'

export type {
  User,
  ParkingSpace,
  Booking,
  Review,
  UserRole,
  SpaceType,
  VehicleType,
  SpaceAmenity,
  BookingStatus,
  PaymentStatus,
  ReviewType,
}

export interface ParkingSpaceWithDetails extends ParkingSpace {
  owner: User
  reviews: Review[]
  bookings: Booking[]
  availability: Availability[]
}

export interface BookingWithDetails extends Booking {
  space: ParkingSpace
  user: User
  review?: Review
}

export interface UserWithDetails extends User {
  ownedSpaces: ParkingSpace[]
  bookings: Booking[]
  reviews: Review[]
  sentReviews: Review[]
}

export interface Availability {
  id: string
  spaceId: string
  date: Date
  startTime: Date
  endTime: Date
  isBlocked: boolean
}

export interface SearchFilters {
  location?: {
    lat: number
    lng: number
    radius: number
  }
  priceRange?: {
    min: number
    max: number
  }
  vehicleTypes?: VehicleType[]
  amenities?: SpaceAmenity[]
  spaceType?: SpaceType
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface BookingRequest {
  spaceId: string
  startDateTime: Date
  endDateTime: Date
  specialRequests?: string
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}
