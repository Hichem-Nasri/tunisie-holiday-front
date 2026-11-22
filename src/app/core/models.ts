export type OfferType = 'FLIGHT' | 'HOTEL' | 'CAR' | 'RENTAL' | 'ACTIVITY';
export type PartnerType = 'AGENCY' | 'HOTEL' | 'CAR_RENTAL' | 'HOST' | 'ACTIVITY';
export type PartnerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
export type Role = 'ADMIN' | 'PARTNER';
export type Cabin = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type Board = 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE';
export type HotelType = 'HOTEL' | 'DAR' | 'RESIDENCE' | 'RESORT';
export type CarCategory = 'CITY' | 'COMPACT' | 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type RentalType = 'VILLA' | 'APARTMENT' | 'DAR' | 'HOUSE';
export type ActivityCategory = 'DESERT' | 'WELLNESS' | 'WATER_SPORTS' | 'CULTURE' | 'NATURE' | 'GASTRONOMY';

export interface Partner {
  id: number;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  email: string;
  phone?: string;
  website?: string;
  city?: string;
  logoUrl?: string;
  description?: string;
  createdAt?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  partner?: Partner;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  region?: string;
  tagline?: string;
  description?: string;
  imageUrl?: string;
  airportCode?: string;
  popular: boolean;
  sortOrder: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  cityCode: string;
  countryCode: string;
}

export interface Currency {
  code: string;
  label: string;
  symbol: string;
  rateToTnd: number;
  updatedAt?: string;
}

export interface Deal {
  type: OfferType;
  title: string;
  subtitle: string;
  badge: string;
  price: number;
  currency: string;
  priceUnit: string;
  imageUrl?: string;
  searchPath: string;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  currency: string;
  nights?: number;
  days?: number;
  sources?: string[];
}

export interface FlightLeg {
  originCode: string;
  destinationCode: string;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  stops: number;
  flightNumber?: string;
}

export interface FlightOption {
  offerKey: string;
  source: string;
  partnerName: string;
  price: number;
  currency: string;
  baggageIncluded: boolean;
  redirectUrl: string;
}

export interface FlightResult {
  id: string;
  airlineCode: string;
  airlineName: string;
  outbound: FlightLeg;
  inbound?: FlightLeg;
  offers: FlightOption[];
  minPrice: number;
  currency: string;
  totalDurationMinutes: number;
  maxStops: number;
}

export interface HotelOption {
  offerId: number;
  partnerName: string;
  board: Board;
  roomType: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  freeCancellation: boolean;
  redirectUrl: string;
}

export interface HotelResult {
  hotelId: number;
  name: string;
  type: HotelType;
  stars: number;
  destination: string;
  destinationSlug: string;
  locationLabel?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount: number;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  offers: HotelOption[];
  bestTotal: number;
  bestPerNight: number;
  currency: string;
}

export interface CarResult {
  offerId: number;
  partnerName: string;
  category: CarCategory;
  model: string;
  seats: number;
  doors: number;
  bags: number;
  transmission: Transmission;
  airConditioning: boolean;
  unlimitedMileage: boolean;
  freeCancellation: boolean;
  minDriverAge: number;
  imageUrl?: string;
  pickupLabel: string;
  pricePerDay: number;
  totalPrice: number;
  currency: string;
  redirectUrl: string;
}

export interface PickupLocation {
  code: string;
  label: string;
}

export interface RentalResult {
  offerId: number;
  partnerName: string;
  title: string;
  type: RentalType;
  destination: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pool: boolean;
  wifi: boolean;
  seaView: boolean;
  minNights: number;
  description?: string;
  imageUrl?: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  redirectUrl: string;
}

export interface ActivityResult {
  offerId: number;
  partnerName: string;
  title: string;
  category: ActivityCategory;
  destination: string;
  durationHours: number;
  meetingPoint?: string;
  description?: string;
  imageUrl?: string;
  pricePerPerson: number;
  totalPrice: number;
  currency: string;
  redirectUrl: string;
}

export interface Hotel {
  id: number;
  name: string;
  destinationId: number;
  destination: string;
  type: HotelType;
  stars: number;
  address?: string;
  locationLabel?: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  amenities: string[];
}

export interface DayCount {
  date: string;
  clicks: number;
}

export interface TypeCount {
  type: string;
  clicks: number;
}

export interface PartnerStats {
  partnerStatus: PartnerStatus;
  clicks30d: number;
  offers: Record<string, number>;
  perDay: DayCount[];
  perType: TypeCount[];
}

export interface AdminStats {
  activePartners: number;
  pendingPartners: number;
  clicks30d: number;
  perDay: DayCount[];
  perType: TypeCount[];
  topPartners: { partnerId: number; name: string; clicks: number }[];
}

export interface ApiError {
  status: number;
  message: string;
  details?: string[];
}

export type PartnerOffer = Record<string, unknown> & { id: number; active: boolean; clicks30d: number };
