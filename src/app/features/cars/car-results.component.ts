import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { CarCategory, CarResult, Transmission } from '../../core/models';
import { CAR_CATEGORY_LABELS, entries } from '../../core/labels';
import { SearchFormComponent } from '../search/search-form.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { LabelPipe } from '../../shared/label.pipe';
import { SearchPage, toggleInSet } from '../../shared/search-page';

@Component({
  selector: 'th-car-results',
  standalone: true,
  imports: [SearchFormComponent, MoneyPipe, LabelPipe],
  templateUrl: './car-results.component.html',
  styleUrl: './car-results.component.scss'
})
export class CarResultsComponent {
  private readonly api = inject(ApiService);
  readonly page = new SearchPage<CarResult>(['location', 'pickupAt', 'dropoffAt'], (q, currency) =>
    this.api.searchCars({ ...q, currency })
  );

  readonly categories = entries(CAR_CATEGORY_LABELS);
  readonly category = signal<CarCategory | 'ALL'>('ALL');
  readonly transmissions = signal<Set<Transmission>>(new Set());
  readonly freeCancellation = signal(false);
  readonly agencies = signal<Set<string>>(new Set());

  readonly availableCategories = computed(() => {
    const present = new Set((this.page.response()?.results ?? []).map((c) => c.category));
    return this.categories.filter((c) => present.has(c.value));
  });

  readonly agencyList = computed(() => [...new Set((this.page.response()?.results ?? []).map((c) => c.partnerName))].sort());

  readonly filtered = computed(() =>
    (this.page.response()?.results ?? [])
      .filter((c) => this.category() === 'ALL' || c.category === this.category())
      .filter((c) => this.transmissions().size === 0 || this.transmissions().has(c.transmission))
      .filter((c) => !this.freeCancellation() || c.freeCancellation)
      .filter((c) => !this.agencies().has(c.partnerName))
  );

  toggleTransmission(t: Transmission): void {
    this.transmissions.update((s) => toggleInSet(s, t));
  }

  toggleAgency(name: string): void {
    this.agencies.update((s) => toggleInSet(s, name));
  }
}
