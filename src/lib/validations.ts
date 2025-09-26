import { z } from 'zod'
import { SpaceType, VehicleType, SpaceAmenity } from '@prisma/client'

export const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
})

export const parkingSpaceSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  pricePerHour: z.number().min(0.01, 'Preço por hora deve ser maior que 0'),
  pricePerDay: z.number().min(0.01, 'Preço por dia deve ser maior que 0').optional(),
  spaceType: z.nativeEnum(SpaceType),
  vehicleTypes: z.array(z.nativeEnum(VehicleType)).min(1, 'Selecione pelo menos um tipo de veículo'),
  amenities: z.array(z.nativeEnum(SpaceAmenity)),
  instructions: z.string().optional(),
  autoApprove: z.boolean().default(true),
})

export const bookingSchema = z.object({
  spaceId: z.string().cuid(),
  startDateTime: z.string().datetime().transform((str) => new Date(str)),
  endDateTime: z.string().datetime().transform((str) => new Date(str)),
  specialRequests: z.string().optional(),
}).refine((data) => data.endDateTime > data.startDateTime, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['endDateTime'],
})

export const reviewSchema = z.object({
  bookingId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  type: z.enum(['SPACE_REVIEW', 'USER_REVIEW']),
})

export const searchSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    radius: z.number().min(0.1).max(50),
  }).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  vehicleTypes: z.array(z.nativeEnum(VehicleType)).optional(),
  amenities: z.array(z.nativeEnum(SpaceAmenity)).optional(),
  spaceType: z.nativeEnum(SpaceType).optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
})

export const availabilitySchema = z.object({
  spaceId: z.string().cuid(),
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  isBlocked: z.boolean().default(false),
}).refine((data) => data.endTime > data.startTime, {
  message: 'Hora de fim deve ser posterior à hora de início',
  path: ['endTime'],
})
