import { ActivityCategory, Board, Cabin, CarCategory, HotelType, OfferType, PartnerStatus, PartnerType, RentalType, Transmission } from './models';

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  FLIGHT: 'Vols',
  HOTEL: 'Hôtels',
  CAR: 'Voitures',
  RENTAL: 'Locations de vacances',
  ACTIVITY: 'Loisirs'
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  AGENCY: 'Agence de voyages',
  HOTEL: 'Hôtel / maison d\'hôtes',
  CAR_RENTAL: 'Loueur de voitures',
  HOST: 'Propriétaire / gestionnaire de locations',
  ACTIVITY: 'Prestataire de loisirs'
};

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  PENDING: 'En attente',
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu'
};

export const CABIN_LABELS: Record<Cabin, string> = {
  ECONOMY: 'Économique',
  PREMIUM_ECONOMY: 'Premium éco',
  BUSINESS: 'Affaires',
  FIRST: 'Première'
};

export const BOARD_LABELS: Record<Board, string> = {
  ROOM_ONLY: 'Logement seul',
  BREAKFAST: 'Petit-déjeuner',
  HALF_BOARD: 'Demi-pension',
  FULL_BOARD: 'Pension complète',
  ALL_INCLUSIVE: 'All inclusive'
};

export const HOTEL_TYPE_LABELS: Record<HotelType, string> = {
  HOTEL: 'Hôtel',
  DAR: 'Dar / maison d\'hôtes',
  RESIDENCE: 'Résidence',
  RESORT: 'Resort'
};

export const CAR_CATEGORY_LABELS: Record<CarCategory, string> = {
  CITY: 'Citadine',
  COMPACT: 'Compacte',
  SEDAN: 'Berline',
  SUV: 'SUV et 4x4',
  VAN: 'Monospace',
  LUXURY: 'Premium'
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: 'Manuelle',
  AUTOMATIC: 'Automatique'
};

export const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
  VILLA: 'Villa',
  APARTMENT: 'Appartement',
  DAR: 'Dar traditionnel',
  HOUSE: 'Maison'
};

export const ACTIVITY_LABELS: Record<ActivityCategory, string> = {
  DESERT: 'Excursions désert',
  WELLNESS: 'Thalasso et spa',
  WATER_SPORTS: 'Mer et nautisme',
  CULTURE: 'Visites culturelles',
  NATURE: 'Nature et randonnée',
  GASTRONOMY: 'Gastronomie'
};

export const AMENITY_LABELS: Record<string, string> = {
  BEACH: 'Accès plage',
  POOL: 'Piscine',
  SPA: 'Thalasso et spa',
  AQUAPARK: 'Aquapark',
  KIDS_CLUB: 'Club enfants',
  WIFI: 'Wi-Fi',
  TERRACE: 'Terrasse'
};

export function entries<K extends string>(labels: Record<K, string>): { value: K; label: string }[] {
  return (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));
}
