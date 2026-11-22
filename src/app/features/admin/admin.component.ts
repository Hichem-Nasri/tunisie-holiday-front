import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { CurrencyService } from '../../core/currency.service';
import { AdminStats, Currency, Destination, Partner, PartnerStatus } from '../../core/models';
import { errorMessage } from '../../core/errors';
import { LabelPipe } from '../../shared/label.pipe';
import { ClickChartComponent } from '../../shared/click-chart.component';

type Tab = 'overview' | 'partners' | 'destinations' | 'currencies';

@Component({
  selector: 'th-admin',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, LabelPipe, ClickChartComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly currencyService = inject(CurrencyService);

  readonly tab = signal<Tab>('overview');
  readonly error = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly stats = signal<AdminStats | null>(null);
  readonly partners = signal<Partner[]>([]);
  readonly partnerFilter = signal<PartnerStatus | ''>('PENDING');
  readonly destinations = signal<Destination[]>([]);
  readonly currencies = signal<Currency[]>([]);
  readonly rateDrafts = signal<Record<string, number>>({});
  readonly editingDestination = signal<number | null | 'new'>(null);

  readonly destinationForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]{2,120}$/)]],
    region: [''],
    tagline: [''],
    description: [''],
    imageUrl: [''],
    airportCode: [''],
    popular: [false],
    sortOrder: [0]
  });

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'partners', label: 'Partenaires' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'currencies', label: 'Devises' }
  ];

  constructor() {
    this.loadStats();
    this.loadPartners();
    this.loadDestinations();
    this.loadCurrencies();
  }

  select(tab: Tab): void {
    this.tab.set(tab);
    this.error.set(null);
    this.notice.set(null);
  }

  loadStats(): void {
    this.api.adminStats().subscribe({ next: (s) => this.stats.set(s), error: (e) => this.error.set(errorMessage(e)) });
  }

  loadPartners(): void {
    const status = this.partnerFilter() || undefined;
    this.api.adminPartners(status).subscribe({ next: (p) => this.partners.set(p), error: (e) => this.error.set(errorMessage(e)) });
  }

  onPartnerFilter(value: string): void {
    this.partnerFilter.set(value as PartnerStatus | '');
    this.loadPartners();
  }

  setStatus(partner: Partner, status: PartnerStatus): void {
    this.api.adminSetPartnerStatus(partner.id, status).subscribe({
      next: (updated) => {
        const filter = this.partnerFilter();
        this.partners.update((list) =>
          filter && updated.status !== filter ? list.filter((p) => p.id !== updated.id) : list.map((p) => (p.id === updated.id ? updated : p))
        );
        this.notice.set(`${updated.name} : ${status === 'ACTIVE' ? 'compte activé' : status === 'SUSPENDED' ? 'compte suspendu' : 'remis en attente'}.`);
        this.loadStats();
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  loadDestinations(): void {
    this.api.destinations().subscribe({ next: (d) => this.destinations.set(d), error: (e) => this.error.set(errorMessage(e)) });
  }

  editDestination(d: Destination | null): void {
    this.editingDestination.set(d ? d.id : 'new');
    this.destinationForm.reset({
      name: d?.name ?? '',
      slug: d?.slug ?? '',
      region: d?.region ?? '',
      tagline: d?.tagline ?? '',
      description: d?.description ?? '',
      imageUrl: d?.imageUrl ?? '',
      airportCode: d?.airportCode ?? '',
      popular: d?.popular ?? false,
      sortOrder: d?.sortOrder ?? this.destinations().length + 1
    });
  }

  saveDestination(): void {
    if (this.destinationForm.invalid) {
      this.destinationForm.markAllAsTouched();
      this.error.set('Nom et slug (minuscules, chiffres et tirets) obligatoires.');
      return;
    }
    const v = this.destinationForm.getRawValue();
    const payload = { ...v, airportCode: v.airportCode ? v.airportCode.toUpperCase() : null, sortOrder: +v.sortOrder };
    const id = this.editingDestination();
    const request = id === 'new' || id === null ? this.api.adminCreateDestination(payload) : this.api.adminUpdateDestination(id, payload);
    request.subscribe({
      next: () => {
        this.editingDestination.set(null);
        this.error.set(null);
        this.notice.set('Destination enregistrée.');
        this.loadDestinations();
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  loadCurrencies(): void {
    this.api.currencies().subscribe({
      next: (c) => {
        this.currencies.set(c);
        this.rateDrafts.set(Object.fromEntries(c.map((x) => [x.code, x.rateToTnd])));
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  setDraft(code: string, value: string): void {
    this.rateDrafts.update((d) => ({ ...d, [code]: +value }));
  }

  saveRate(code: string): void {
    const rate = this.rateDrafts()[code];
    if (!rate || rate <= 0) {
      this.error.set('Le taux doit être positif.');
      return;
    }
    this.api.adminUpdateRate(code, rate).subscribe({
      next: () => {
        this.notice.set(`Taux ${code} mis à jour.`);
        this.loadCurrencies();
        this.currencyService.currencies.update((list) => list.map((c) => (c.code === code ? { ...c, rateToTnd: rate } : c)));
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }
}
