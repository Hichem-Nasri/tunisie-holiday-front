import { DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Observable, catchError, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { CurrencyService } from '../core/currency.service';
import { SearchResponse } from '../core/models';
import { errorMessage } from '../core/errors';

export class SearchPage<T> {
  readonly currency = inject(CurrencyService);
  readonly query = signal<Record<string, string>>({});
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly response = signal<SearchResponse<T> | null>(null);

  constructor(private readonly required: string[], fetch: (query: Record<string, string>, currency: string) => Observable<SearchResponse<T>>) {
    const route = inject(ActivatedRoute);
    const destroyRef = inject(DestroyRef);
    combineLatest([route.queryParamMap, toObservable(this.currency.current)])
      .pipe(
        map(([params, currency]) => {
          const q: Record<string, string> = {};
          params.keys.forEach((k) => (q[k] = params.get(k) ?? ''));
          return { q, currency };
        }),
        tap(({ q }) => {
          this.query.set(q);
          this.error.set(null);
        }),
        switchMap(({ q, currency }) => {
          if (required.some((k) => !q[k])) {
            return of(null);
          }
          this.loading.set(true);
          return fetch(q, currency).pipe(
            catchError((e) => {
              this.error.set(errorMessage(e));
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((res) => {
        this.loading.set(false);
        this.response.set(res);
      });
  }

  hasSearch(): boolean {
    const q = this.query();
    return this.required.every((k) => !!q[k]);
  }
}

export function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}
