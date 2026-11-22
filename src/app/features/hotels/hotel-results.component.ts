import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { Board, HotelResult, HotelType } from '../../core/models';
import { AMENITY_LABELS, BOARD_LABELS, HOTEL_TYPE_LABELS, entries } from '../../core/labels';
import { SearchFormComponent } from '../search/search-form.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { LabelPipe } from '../../shared/label.pipe';
import { StarsComponent } from '../../shared/stars.component';
import { SearchPage, toggleInSet } from '../../shared/search-page';

type Sort = 'RECOMMENDED' | 'PRICE' | 'RATING' | 'STARS';

@Component({
  selector: 'th-hotel-results',
  standalone: true,
  imports: [SearchFormComponent, MoneyPipe, LabelPipe, StarsComponent],
  templateUrl: './hotel-results.component.html',
  styleUrl: './hotel-results.component.scss'
})
export class HotelResultsComponent {
  private readonly api = inject(ApiService);
  readonly page = new SearchPage<HotelResult>(['checkIn', 'checkOut'], (q, currency) =>
    this.api.searchHotels({ ...q, currency })
  );

  readonly boards = entries(BOARD_LABELS);
  readonly types = entries(HOTEL_TYPE_LABELS);
  readonly amenities = Object.entries(AMENITY_LABELS).map(([value, label]) => ({ value, label }));

  readonly sort = signal<Sort>('RECOMMENDED');
  readonly stars = signal<Set<number>>(new Set());
  readonly selectedBoards = signal<Set<Board>>(new Set());
  readonly selectedTypes = signal<Set<HotelType>>(new Set());
  readonly selectedAmenities = signal<Set<string>>(new Set());
  readonly freeCancellation = signal(false);
  readonly expanded = signal<Set<number>>(new Set());

  readonly filtered = computed(() => {
    const list = (this.page.response()?.results ?? [])
      .map((h) => {
        const boards = this.selectedBoards();
        const offers = h.offers.filter(
          (o) => (boards.size === 0 || boards.has(o.board)) && (!this.freeCancellation() || o.freeCancellation)
        );
        return offers.length ? { ...h, offers, bestTotal: offers[0].totalPrice, bestPerNight: offers[0].pricePerNight } : null;
      })
      .filter((h): h is HotelResult => h !== null)
      .filter((h) => this.stars().size === 0 || this.stars().has(h.stars))
      .filter((h) => this.selectedTypes().size === 0 || this.selectedTypes().has(h.type))
      .filter((h) => [...this.selectedAmenities()].every((a) => h.amenities.includes(a)));
    const sort = this.sort();
    return list.sort((a, b) => {
      if (sort === 'PRICE') return a.bestTotal - b.bestTotal;
      if (sort === 'RATING') return (b.rating ?? 0) - (a.rating ?? 0) || a.bestTotal - b.bestTotal;
      if (sort === 'STARS') return b.stars - a.stars || a.bestTotal - b.bestTotal;
      return ((b.rating ?? 7) * 10 - b.bestPerNight / 50) - ((a.rating ?? 7) * 10 - a.bestPerNight / 50);
    });
  });

  readonly destinationLabel = computed(() => this.page.query()['q'] || 'toute la Tunisie');

  toggleStar(n: number): void {
    this.stars.update((s) => toggleInSet(s, n));
  }

  toggleBoard(b: Board): void {
    this.selectedBoards.update((s) => toggleInSet(s, b));
  }

  toggleType(t: HotelType): void {
    this.selectedTypes.update((s) => toggleInSet(s, t));
  }

  toggleAmenity(a: string): void {
    this.selectedAmenities.update((s) => toggleInSet(s, a));
  }

  toggleExpanded(id: number): void {
    this.expanded.update((s) => toggleInSet(s, id));
  }

  onSort(value: string): void {
    this.sort.set(value as Sort);
  }

  reset(): void {
    this.stars.set(new Set());
    this.selectedBoards.set(new Set());
    this.selectedTypes.set(new Set());
    this.selectedAmenities.set(new Set());
    this.freeCancellation.set(false);
  }

  ratingLabel(r?: number): string {
    if (!r) return 'Nouveau';
    if (r >= 9) return 'Exceptionnel';
    if (r >= 8.5) return 'Excellent';
    if (r >= 8) return 'Très bien';
    if (r >= 7) return 'Bien';
    return 'Correct';
  }
}
