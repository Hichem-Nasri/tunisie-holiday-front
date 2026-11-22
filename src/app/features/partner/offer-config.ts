import { OfferType, PartnerType } from '../../core/models';
import {
  ACTIVITY_LABELS, BOARD_LABELS, CABIN_LABELS, CAR_CATEGORY_LABELS, RENTAL_TYPE_LABELS, TRANSMISSION_LABELS, entries
} from '../../core/labels';

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'datetime' | 'textarea' | 'url' | 'hotel' | 'destination';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  default?: string | number | boolean;
  wide?: boolean;
}

export interface ColumnDef {
  key: string;
  label: string;
  format?: 'money' | 'datetime' | 'bool' | 'label';
  dictionary?: string;
}

export interface OfferConfig {
  type: OfferType;
  slug: string;
  title: string;
  singular: string;
  fields: FieldDef[];
  columns: ColumnDef[];
}

const CURRENCIES = ['TND', 'EUR', 'USD', 'GBP'].map((c) => ({ value: c, label: c }));

const COMMON: FieldDef[] = [
  { key: 'price', label: 'Prix', type: 'number', required: true, min: 0.01, step: 0.01 },
  { key: 'currency', label: 'Devise', type: 'select', required: true, options: CURRENCIES, default: 'TND' },
  { key: 'deeplinkUrl', label: 'Lien de réservation sur votre site', type: 'url', required: true, placeholder: 'https://', wide: true }
];

export const OFFER_CONFIGS: OfferConfig[] = [
  {
    type: 'FLIGHT',
    slug: 'vols',
    title: 'Vols',
    singular: 'un vol',
    fields: [
      { key: 'airlineCode', label: 'Code compagnie', type: 'text', required: true, placeholder: 'TU' },
      { key: 'airlineName', label: 'Compagnie', type: 'text', required: true, placeholder: 'Tunisair' },
      { key: 'flightNumber', label: 'N° de vol', type: 'text', placeholder: 'TU 723' },
      { key: 'originCode', label: 'Aéroport de départ', type: 'text', required: true, placeholder: 'ORY' },
      { key: 'destinationCode', label: 'Aéroport d\'arrivée', type: 'text', required: true, placeholder: 'DJE' },
      { key: 'departureAt', label: 'Départ (heure locale)', type: 'datetime', required: true },
      { key: 'arrivalAt', label: 'Arrivée (heure locale)', type: 'datetime', required: true },
      { key: 'stops', label: 'Escales', type: 'number', min: 0, max: 3, default: 0 },
      { key: 'cabin', label: 'Classe', type: 'select', options: entries(CABIN_LABELS), default: 'ECONOMY' },
      { key: 'seatsAvailable', label: 'Places disponibles', type: 'number', min: 0, max: 999, default: 9 },
      { key: 'baggageIncluded', label: 'Bagage en soute inclus', type: 'checkbox', default: true },
      { ...COMMON[0], label: 'Prix par personne (aller simple)' },
      COMMON[1],
      COMMON[2]
    ],
    columns: [
      { key: 'flightNumber', label: 'Vol' },
      { key: 'originCode', label: 'De' },
      { key: 'destinationCode', label: 'Vers' },
      { key: 'departureAt', label: 'Départ', format: 'datetime' },
      { key: 'seatsAvailable', label: 'Places' },
      { key: 'price', label: 'Prix', format: 'money' }
    ]
  },
  {
    type: 'HOTEL',
    slug: 'hotels',
    title: 'Hôtels',
    singular: 'une offre d\'hôtel',
    fields: [
      { key: 'hotelId', label: 'Hôtel', type: 'hotel', required: true, wide: true },
      { key: 'roomType', label: 'Type de chambre', type: 'text', required: true, placeholder: 'Chambre double vue mer' },
      { key: 'board', label: 'Formule', type: 'select', options: entries(BOARD_LABELS), default: 'HALF_BOARD' },
      { key: 'maxGuests', label: 'Personnes max. par chambre', type: 'number', min: 1, max: 20, default: 2 },
      { key: 'freeCancellation', label: 'Annulation gratuite', type: 'checkbox', default: true },
      { ...COMMON[0], label: 'Prix par nuit et par chambre' },
      COMMON[1],
      COMMON[2]
    ],
    columns: [
      { key: 'hotelName', label: 'Hôtel' },
      { key: 'roomType', label: 'Chambre' },
      { key: 'board', label: 'Formule', format: 'label', dictionary: 'board' },
      { key: 'price', label: 'Prix / nuit', format: 'money' }
    ]
  },
  {
    type: 'CAR',
    slug: 'voitures',
    title: 'Voitures',
    singular: 'un véhicule',
    fields: [
      { key: 'pickupCode', label: 'Code agence / aéroport', type: 'text', required: true, placeholder: 'TUN' },
      { key: 'pickupLabel', label: 'Lieu de prise en charge', type: 'text', required: true, placeholder: 'Aéroport Tunis-Carthage' },
      { key: 'category', label: 'Catégorie', type: 'select', options: entries(CAR_CATEGORY_LABELS), default: 'CITY' },
      { key: 'model', label: 'Modèle', type: 'text', required: true, placeholder: 'Kia Picanto' },
      { key: 'transmission', label: 'Boîte de vitesses', type: 'select', options: entries(TRANSMISSION_LABELS), default: 'MANUAL' },
      { key: 'seats', label: 'Places', type: 'number', min: 1, max: 9, default: 5 },
      { key: 'doors', label: 'Portes', type: 'number', min: 2, max: 5, default: 5 },
      { key: 'bags', label: 'Valises', type: 'number', min: 0, max: 10, default: 2 },
      { key: 'minDriverAge', label: 'Âge minimum du conducteur', type: 'number', min: 18, max: 30, default: 21 },
      { key: 'imageUrl', label: 'Photo (URL)', type: 'url', placeholder: 'https://', wide: true },
      { key: 'airConditioning', label: 'Climatisation', type: 'checkbox', default: true },
      { key: 'unlimitedMileage', label: 'Kilométrage illimité', type: 'checkbox', default: true },
      { key: 'freeCancellation', label: 'Annulation gratuite', type: 'checkbox', default: true },
      { ...COMMON[0], label: 'Prix par jour' },
      COMMON[1],
      COMMON[2]
    ],
    columns: [
      { key: 'model', label: 'Modèle' },
      { key: 'category', label: 'Catégorie', format: 'label', dictionary: 'car' },
      { key: 'pickupLabel', label: 'Lieu' },
      { key: 'price', label: 'Prix / jour', format: 'money' }
    ]
  },
  {
    type: 'RENTAL',
    slug: 'locations',
    title: 'Locations de vacances',
    singular: 'une location',
    fields: [
      { key: 'title', label: 'Titre de l\'annonce', type: 'text', required: true, wide: true },
      { key: 'destinationId', label: 'Destination', type: 'destination', required: true },
      { key: 'type', label: 'Type', type: 'select', options: entries(RENTAL_TYPE_LABELS), default: 'VILLA' },
      { key: 'capacity', label: 'Voyageurs max.', type: 'number', min: 1, max: 30, default: 4 },
      { key: 'bedrooms', label: 'Chambres', type: 'number', min: 0, max: 15, default: 2 },
      { key: 'bathrooms', label: 'Salles de bain', type: 'number', min: 0, max: 15, default: 1 },
      { key: 'minNights', label: 'Nuits minimum', type: 'number', min: 1, max: 60, default: 2 },
      { key: 'imageUrl', label: 'Photo (URL)', type: 'url', placeholder: 'https://', wide: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { key: 'pool', label: 'Piscine', type: 'checkbox', default: false },
      { key: 'wifi', label: 'Wi-Fi', type: 'checkbox', default: true },
      { key: 'seaView', label: 'Vue mer', type: 'checkbox', default: false },
      { ...COMMON[0], label: 'Prix par nuit' },
      COMMON[1],
      COMMON[2]
    ],
    columns: [
      { key: 'title', label: 'Annonce' },
      { key: 'destination', label: 'Destination' },
      { key: 'capacity', label: 'Voyageurs' },
      { key: 'price', label: 'Prix / nuit', format: 'money' }
    ]
  },
  {
    type: 'ACTIVITY',
    slug: 'loisirs',
    title: 'Loisirs',
    singular: 'une activité',
    fields: [
      { key: 'title', label: 'Titre de l\'activité', type: 'text', required: true, wide: true },
      { key: 'destinationId', label: 'Destination', type: 'destination', required: true },
      { key: 'category', label: 'Catégorie', type: 'select', options: entries(ACTIVITY_LABELS), default: 'DESERT' },
      { key: 'durationHours', label: 'Durée (heures)', type: 'number', min: 0.5, step: 0.5, default: 4 },
      { key: 'meetingPoint', label: 'Point de rendez-vous', type: 'text' },
      { key: 'imageUrl', label: 'Photo (URL)', type: 'url', placeholder: 'https://', wide: true },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      { ...COMMON[0], label: 'Prix par personne' },
      COMMON[1],
      COMMON[2]
    ],
    columns: [
      { key: 'title', label: 'Activité' },
      { key: 'destination', label: 'Destination' },
      { key: 'category', label: 'Catégorie', format: 'label', dictionary: 'activity' },
      { key: 'price', label: 'Prix / pers.', format: 'money' }
    ]
  }
];

export const ALLOWED_TYPES: Record<PartnerType, OfferType[]> = {
  AGENCY: ['FLIGHT', 'HOTEL', 'CAR', 'RENTAL', 'ACTIVITY'],
  HOTEL: ['HOTEL'],
  CAR_RENTAL: ['CAR'],
  HOST: ['RENTAL'],
  ACTIVITY: ['ACTIVITY']
};

export function configBySlug(slug: string): OfferConfig | undefined {
  return OFFER_CONFIGS.find((c) => c.slug === slug);
}
