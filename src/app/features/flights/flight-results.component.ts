import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { CurrencyService } from '../../core/currency.service';
import { FlightResult, SearchResponse } from '../../core/models';
import { errorMessage } from '../../core/errors';
import { SearchFormComponent } from '../search/search-form.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { DurationPipe } from '../../shared/duration.pipe';

type Sort = 'PRICE' | 'DURATION' | 'BEST';
type Slot = 'morning' | 'afternoon' | 'evening' | 'night';

@Component({
  selector: 'th-flight-results',
  standalone: true,
  imports: [SearchFormComponent, MoneyPipe, DurationPipe, DatePipe, FormsModule],
  templateUrl: './flight-results.component.html',
  styleUrl: './flight-results.component.scss'
})
export class FlightResultsComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly currency = inject(CurrencyService);

  readonly query = signal<Record<string, string>>({});
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly response = signal<SearchResponse<FlightResult> | null>(null);
  readonly expanded = signal<string | null>(null);

  readonly sort = signal<Sort>('PRICE');
  readonly stops = signal<Set<number>>(new Set([0, 1, 2]));
  readonly excludedAirlines = signal<Set<string>>(new Set());
  readonly slots = signal<Set<Slot>>(new Set());
  readonly maxPrice = signal<number | null>(null);

  readonly alertEmail = signal('');
  readonly alertState = signal<'idle' | 'open' | 'sent' | 'error'>('idle');

  readonly airlines = computed(() => {
    const map = new Map<string, string>();
    this.response()?.results.forEach((r) => map.set(r.airlineCode, r.airlineName));
    return [...map.entries()].map(([code, name]) => ({ code, name }));
  });

  readonly priceBounds = computed(() => {
    const prices = this.response()?.results.map((r) => r.minPrice) ?? [];
    return prices.length ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) } : { min: 0, max: 0 };
  });

  readonly filtered = computed(() => {
    const results = this.response()?.results ?? [];
    const stops = this.stops();
    const excluded = this.excludedAirlines();
    const slots = this.slots();
    const max = this.maxPrice();
    const list = results.filter(
      (r) =>
        stops.has(Math.min(r.maxStops, 2)) &&
        !excluded.has(r.airlineCode) &&
        (slots.size === 0 || slots.has(this.slotOf(r.outbound.departureAt))) &&
        (max === null || r.minPrice <= max)
    );
    return this.sortList(list, this.sort());
  });

  readonly cheapest = computed<FlightResult | null>(() => this.sortList(this.filtered(), 'PRICE')[0] ?? null);
  readonly fastest = computed<FlightResult | null>(() => this.sortList(this.filtered(), 'DURATION')[0] ?? null);
  readonly best = computed<FlightResult | null>(() => this.sortList(this.filtered(), 'BEST')[0] ?? null);

  readonly slotsList: { id: Slot; label: string }[] = [
    { id: 'morning', label: 'Matin' },
    { id: 'afternoon', label: 'Après-midi' },
    { id: 'evening', label: 'Soir' },
    { id: 'night', label: 'Nuit' }
  ];

  constructor() {
    combineLatest([this.route.queryParamMap, toObservable(this.currency.current)])
      .pipe(
        map(([params, currency]) => {
          const q: Record<string, string> = {};
          params.keys.forEach((k) => (q[k] = params.get(k) ?? ''));
          return { q, currency };
        }),
        tap(({ q }) => {
          this.query.set(q);
          this.error.set(null);
          this.maxPrice.set(null);
        }),
        switchMap(({ q, currency }) => {
          if (!q['origin'] || !q['destination'] || !q['departureDate']) {
            this.response.set(null);
            return of(null);
          }
          this.loading.set(true);
          return this.api.searchFlights({ ...q, currency }).pipe(
            catchError((e) => {
              this.error.set(errorMessage(e));
              return of(null);
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((res) => {
        this.loading.set(false);
        this.response.set(res);
      });
  }

  hasSearch(): boolean {
    const q = this.query();
    return !!(q['origin'] && q['destination'] && q['departureDate']);
  }

  toggleStop(n: number): void {
    this.stops.update((s) => this.toggle(s, n));
  }

  toggleAirline(code: string): void {
    this.excludedAirlines.update((s) => this.toggle(s, code));
  }

  toggleSlot(slot: Slot): void {
    this.slots.update((s) => this.toggle(s, slot));
  }

  onMaxPrice(value: string): void {
    this.maxPrice.set(value === '' ? null : +value);
  }

  resetFilters(): void {
    this.stops.set(new Set([0, 1, 2]));
    this.excludedAirlines.set(new Set());
    this.slots.set(new Set());
    this.maxPrice.set(null);
  }

  toggleExpanded(id: string): void {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  stopsLabel(stops: number): string {
    return stops === 0 ? 'Direct' : stops === 1 ? '1 escale' : `${stops} escales`;
  }

  sendAlert(): void {
    const q = this.query();
    const email = this.alertEmail().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.alertState.set('error');
      return;
    }
    this.api
      .createAlert({
        email,
        origin: q['origin'],
        destination: q['destination'],
        departureDate: q['departureDate'],
        returnDate: q['returnDate'] || null,
        maxPrice: this.cheapest()?.minPrice ?? null,
        currency: this.currency.current()
      })
      .subscribe({ next: () => this.alertState.set('sent'), error: () => this.alertState.set('error') });
  }

  private slotOf(iso: string): Slot {
    const h = new Date(iso).getHours();
    return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : h >= 18 && h < 23 ? 'evening' : 'night';
  }

  private sortList(list: FlightResult[], sort: Sort): FlightResult[] {
    const copy = [...list];
    if (sort === 'PRICE') {
      return copy.sort((a, b) => a.minPrice - b.minPrice || a.totalDurationMinutes - b.totalDurationMinutes);
    }
    if (sort === 'DURATION') {
      return copy.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes || a.minPrice - b.minPrice);
    }
    const minP = Math.max(1, Math.min(...copy.map((r) => r.minPrice)));
    const minD = Math.max(1, Math.min(...copy.map((r) => r.totalDurationMinutes)));
    const score = (r: FlightResult) => r.minPrice / minP + r.totalDurationMinutes / minD;
    return copy.sort((a, b) => score(a) - score(b));
  }

  private toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    return next;
  }
}
