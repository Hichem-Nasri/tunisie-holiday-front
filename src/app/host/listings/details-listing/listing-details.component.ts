import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../models/listing.model';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.scss'],
})
export class ListingDetailsComponent implements OnInit {
  loading = false;
  listing: Listing | null = null;

  // fallback image
  noImage = 'assets/images/no-image.png';

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.loading = true;
    this.listingService.getListingById(id).subscribe({
      next: (data) => {
        this.listing = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Load listing details error', err);
        this.loading = false;
        alert("Impossible de charger les détails de l'annonce");
      },
    });
  }

 toggleStatus() {
  console.log('toogle status')
  if (!this.listing) return;

  const newStatus =
    this.listing.status === 'PUBLISHED'
      ? 'DISABLED'
      : 'PUBLISHED';

  this.listingService
    .updateStatus(this.listing.id!, newStatus)
    .subscribe(updated => {
      this.listing = updated;
    });
}

  get images(): string[] {
    const urls =
      (this.listing as any)?.images ??
      (this.listing?.images ?? []).map((img: any) => img.url).filter(Boolean);

    return urls?.length ? urls : [this.noImage];
  }

  formatType(type?: string): string {
    switch (type) {
      case 'APARTMENT':
        return 'Appartement';
      case 'ROOM':
        return 'Chambre';
      case 'HOTEL_ROOM':
        return 'Chambre d’hôtel';
      default:
        return type ?? '';
    }
  }
} 
