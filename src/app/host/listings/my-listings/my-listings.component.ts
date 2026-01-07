import { Component, OnInit } from '@angular/core';
import { ListingService } from '../../../core/services/listing.service';
import { Listing } from '../../../models/listing.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-listings.component.html',
  styleUrls: ['./my-listings.component.scss'],
})
export class MyListingsComponent implements OnInit {
  allListings: Listing[] = [];
  listings: Listing[] = [];
  selectedStatus = '';
  sortBy = 'createdAt_desc';
  loading = false;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadMyListings();
  }

  loadMyListings(): void {
    this.loading = true;
    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.allListings = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load listings');
      },
    });
  }

  applyFilters(): void {
    let result = [...this.allListings];

    // ✅ Filtre par statut
    if (this.selectedStatus) {
      result = result.filter((l) => l.status === this.selectedStatus);
    }

    // ✅ Tri
    switch (this.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;

      case 'price_desc':
        result.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;

      case 'createdAt_asc':
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;

      case 'createdAt_desc':
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    this.listings = result;
  }

  // ✅ SUPPRESSION
  deleteListing(id: number): void {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir supprimer cette annonce ?'
    );

    if (!confirmed) return;

    this.listingService.deleteListing(id).subscribe({
      next: () => {
        // ✅ suppression côté UI (sans recharger)
        this.listings = this.listings.filter((l) => l.id !== id);
      },
      error: () => {
        alert('Erreur lors de la suppression');
      },
    });
  }

  trackById(index: number, listing: Listing): number | undefined {
    return listing.id;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PUBLISHED':
        return 'Publiée';
      case 'DRAFT':
        return 'Brouillon';
      case 'DISABLED':
        return 'Désactivée';
      default:
        return status;
    }
  }
}
