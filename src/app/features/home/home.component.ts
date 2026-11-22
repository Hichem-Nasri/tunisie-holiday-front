import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { SearchFormComponent } from '../search/search-form.component';
import { ApiService } from '../../core/api.service';
import { CurrencyService } from '../../core/currency.service';
import { Deal, Destination } from '../../core/models';
import { MoneyPipe } from '../../shared/money.pipe';
import { addDays } from '../../core/dates';

@Component({
  selector: 'th-home',
  standalone: true,
  imports: [SearchFormComponent, RouterLink, MoneyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly currency = inject(CurrencyService);

  readonly destinations = signal<Destination[]>([]);
  readonly deals = signal<Deal[]>([]);
  readonly loadingDeals = signal(true);

  constructor() {
    this.api.destinations().subscribe({
      next: (list) => this.destinations.set(list.filter((d) => d.popular)),
      error: () => this.destinations.set([])
    });
    toObservable(this.currency.current)
      .pipe(
        switchMap((c) => this.api.deals(c).pipe(catchError(() => of([] as Deal[])))),
        takeUntilDestroyed()
      )
      .subscribe((deals) => {
        this.deals.set(deals);
        this.loadingDeals.set(false);
      });
  }

  openDestination(d: Destination): void {
    this.router.navigate(['/hotels'], { queryParams: { q: d.name, checkIn: addDays(30), checkOut: addDays(37), adults: 2 } });
  }

  openDeal(deal: Deal): void {
    const [path, query] = deal.searchPath.split('?');
    const params = Object.fromEntries(new URLSearchParams(query ?? ''));
    const extra: Record<string, string> =
      deal.type === 'CAR'
        ? { pickupAt: `${addDays(30)}T10:00`, dropoffAt: `${addDays(37)}T10:00` }
        : deal.type === 'ACTIVITY'
          ? { date: addDays(30) }
          : { checkIn: addDays(30), checkOut: addDays(37) };
    this.router.navigate([path], { queryParams: { ...params, ...extra } });
  }
}
