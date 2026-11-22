import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ActivityResult, AdminStats, Airport, AuthResponse, CarResult, Currency, Deal, Destination, FlightResult, Hotel,
  HotelResult, OfferType, Partner, PartnerOffer, PartnerStats, PartnerStatus, PickupLocation, RentalResult,
  SearchResponse, User
} from './models';

type ParamValue = string | number | boolean | null | undefined | (string | number)[];

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password });
  }

  registerPartner(payload: Record<string, unknown>): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register-partner`, payload);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/auth/me`);
  }

  destinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.base}/destinations`);
  }

  airports(q?: string): Observable<Airport[]> {
    return this.http.get<Airport[]>(`${this.base}/airports`, { params: this.params({ q }) });
  }

  currencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.base}/currencies`);
  }

  deals(currency: string): Observable<Deal[]> {
    return this.http.get<Deal[]>(`${this.base}/deals`, { params: this.params({ currency }) });
  }

  createAlert(payload: Record<string, unknown>): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.base}/alerts`, payload);
  }

  searchFlights(query: Record<string, ParamValue>): Observable<SearchResponse<FlightResult>> {
    return this.http.get<SearchResponse<FlightResult>>(`${this.base}/search/flights`, { params: this.params(query) });
  }

  searchHotels(query: Record<string, ParamValue>): Observable<SearchResponse<HotelResult>> {
    return this.http.get<SearchResponse<HotelResult>>(`${this.base}/search/hotels`, { params: this.params(query) });
  }

  carLocations(): Observable<PickupLocation[]> {
    return this.http.get<PickupLocation[]>(`${this.base}/search/cars/locations`);
  }

  searchCars(query: Record<string, ParamValue>): Observable<SearchResponse<CarResult>> {
    return this.http.get<SearchResponse<CarResult>>(`${this.base}/search/cars`, { params: this.params(query) });
  }

  searchRentals(query: Record<string, ParamValue>): Observable<SearchResponse<RentalResult>> {
    return this.http.get<SearchResponse<RentalResult>>(`${this.base}/search/rentals`, { params: this.params(query) });
  }

  searchActivities(query: Record<string, ParamValue>): Observable<SearchResponse<ActivityResult>> {
    return this.http.get<SearchResponse<ActivityResult>>(`${this.base}/search/activities`, { params: this.params(query) });
  }

  partnerMe(): Observable<Partner> {
    return this.http.get<Partner>(`${this.base}/partner/me`);
  }

  updatePartnerMe(payload: Record<string, unknown>): Observable<Partner> {
    return this.http.put<Partner>(`${this.base}/partner/me`, payload);
  }

  partnerStats(): Observable<PartnerStats> {
    return this.http.get<PartnerStats>(`${this.base}/partner/stats`);
  }

  partnerOffers(type: OfferType): Observable<PartnerOffer[]> {
    return this.http.get<PartnerOffer[]>(`${this.base}/partner/offers/${type}`);
  }

  createOffer(type: OfferType, payload: Record<string, unknown>): Observable<PartnerOffer> {
    return this.http.post<PartnerOffer>(`${this.base}/partner/offers/${type}`, payload);
  }

  updateOffer(type: OfferType, id: number, payload: Record<string, unknown>): Observable<PartnerOffer> {
    return this.http.put<PartnerOffer>(`${this.base}/partner/offers/${type}/${id}`, payload);
  }

  setOfferActive(type: OfferType, id: number, active: boolean): Observable<PartnerOffer> {
    return this.http.patch<PartnerOffer>(`${this.base}/partner/offers/${type}/${id}/active`, { active });
  }

  deleteOffer(type: OfferType, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/partner/offers/${type}/${id}`);
  }

  partnerHotels(q?: string): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.base}/partner/hotels`, { params: this.params({ q }) });
  }

  createHotel(payload: Record<string, unknown>): Observable<Hotel> {
    return this.http.post<Hotel>(`${this.base}/partner/hotels`, payload);
  }

  adminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/admin/stats`);
  }

  adminPartners(status?: PartnerStatus): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.base}/admin/partners`, { params: this.params({ status }) });
  }

  adminSetPartnerStatus(id: number, status: PartnerStatus): Observable<Partner> {
    return this.http.patch<Partner>(`${this.base}/admin/partners/${id}/status`, { status });
  }

  adminCreateDestination(payload: Record<string, unknown>): Observable<Destination> {
    return this.http.post<Destination>(`${this.base}/admin/destinations`, payload);
  }

  adminUpdateDestination(id: number, payload: Record<string, unknown>): Observable<Destination> {
    return this.http.put<Destination>(`${this.base}/admin/destinations/${id}`, payload);
  }

  adminUpdateRate(code: string, rateToTnd: number): Observable<Currency> {
    return this.http.put<Currency>(`${this.base}/admin/currencies/${code}`, { rateToTnd });
  }

  private params(values: Record<string, ParamValue>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => (params = params.append(key, String(v))));
      } else {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}
