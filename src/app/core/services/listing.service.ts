import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing } from '../../models/listing.model';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private apiUrl = 'http://localhost:8080/api/host/listings';

  constructor(private http: HttpClient) {}

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}`);
  }

  deleteListing(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createListing(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  getListingById(id: number) {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  updateListing(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  uploadImages(listingId: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return this.http.post(`${this.apiUrl}/${listingId}/images`, formData);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<Listing>(`${this.apiUrl}/${id}/status`, null, {
      params: { status },
    });
  }
}
