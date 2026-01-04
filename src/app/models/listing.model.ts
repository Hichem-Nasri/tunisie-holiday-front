export interface Listing {
  id?: number;
  title: string;
  description: string;
  maxGuests: number;
  pricePerNight: number;
  address: string;
  city: string;
  type: 'APARTMENT' | 'HOTEL';
  status : string ;
  images?: string[];
  // Nouveaux champs
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  amenities?: string[];
  houseRules?: string;
  checkInTime?: string;   // "14:00"
  checkOutTime?: string;  // "11:00"
  createdAt : Date ;
}
