import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Currency } from './models';

const STORAGE_KEY = 'th.currency';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly api = inject(ApiService);

  readonly currencies = signal<Currency[]>([
    { code: 'TND', label: 'Dinar tunisien', symbol: 'DT', rateToTnd: 1 },
    { code: 'EUR', label: 'Euro', symbol: '€', rateToTnd: 3.4 },
    { code: 'USD', label: 'Dollar américain', symbol: '$', rateToTnd: 3.1 },
    { code: 'GBP', label: 'Livre sterling', symbol: '£', rateToTnd: 3.95 }
  ]);
  readonly current = signal<string>(this.read());

  constructor() {
    this.api.currencies().subscribe({ next: (list) => list.length && this.currencies.set(list), error: () => undefined });
  }

  set(code: string): void {
    this.current.set(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      return;
    }
  }

  private read(): string {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? 'TND';
    } catch {
      return 'TND';
    }
  }
}
