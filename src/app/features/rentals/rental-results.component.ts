import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { RentalResult, RentalType } from '../../core/models';
import { RENTAL_TYPE_LABELS, entries } from '../../core/labels';
import { SearchFormComponent } from '../search/search-form.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { LabelPipe } from '../../shared/label.pipe';
import { SearchPage, toggleInSet } from '../../shared/search-page';

@Component({
  selector: 'th-rental-results',
  standalone: true,
  imports: [SearchFormComponent, MoneyPipe, LabelPipe],
  templateUrl: './rental-results.component.html',
  styleUrl: '../../shared/listing.scss'
})
export class RentalResultsComponent {
  private readonly api = inject(ApiService);
  readonly page = new SearchPage<RentalResult>(['checkIn', 'checkOut'], (q, currency) =>
    this.api.searchRentals({ ...q, currency })
  );

  readonly types = entries(RENTAL_TYPE_LABELS);
  readonly selectedTypes = signal<Set<RentalType>>(new Set());
  readonly pool = signal(false);
  readonly seaView = signal(false);

  readonly filtered = computed(() =>
    (this.page.response()?.results ?? [])
      .filter((r) => this.selectedTypes().size === 0 || this.selectedTypes().has(r.type))
      .filter((r) => !this.pool() || r.pool)
      .filter((r) => !this.seaView() || r.seaView)
  );

  toggleType(t: RentalType): void {
    this.selectedTypes.update((s) => toggleInSet(s, t));
  }
}
