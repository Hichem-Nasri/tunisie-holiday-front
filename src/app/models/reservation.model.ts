export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: number;
  listingId: number;
  listingTitle: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: ReservationStatus;
  paymentMethod :string ;
  paymentStatus : string ;
  createdAt: string;
}
