import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../../models/reservation.model';
import { HostRevenue } from '../../models/host-revenue.model';
import { MonthlyRevenue } from '../../models/monthly-revenue.model';
import { TopListingRevenue } from '../../models/top-listing-revenue.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/host/reservations';

  constructor(private http: HttpClient) {}

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}/status`, null, {
      params: { status },
    });
  }

  getRevenues() {
    return this.http.get<HostRevenue>(`${this.apiUrl}/revenues`);
  }

  getMonthlyRevenues() {
    return this.http.get<MonthlyRevenue[]>(`${this.apiUrl}/revenues/monthly`);
  }

  getTopListings() {
    return this.http.get<TopListingRevenue[]>(
      `${this.apiUrl}/revenues/top-listings`
    );
  }

  markAsPaid(reservationId: number) {
    return this.http.patch<Reservation>(
      `${this.apiUrl}/${reservationId}/mark-paid`,
      {}
    );
  }
}
