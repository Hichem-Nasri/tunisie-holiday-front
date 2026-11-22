import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Destination, Hotel, PartnerOffer } from '../../core/models';
import { errorMessage } from '../../core/errors';
import { AMENITY_LABELS, HOTEL_TYPE_LABELS, entries } from '../../core/labels';
import { MoneyPipe } from '../../shared/money.pipe';
import { LabelPipe } from '../../shared/label.pipe';
import { ColumnDef, FieldDef, OfferConfig, configBySlug } from './offer-config';

const UPPERCASE_KEYS = ['airlineCode', 'originCode', 'destinationCode', 'pickupCode'];

@Component({
  selector: 'th-partner-offers',
  standalone: true,
  imports: [ReactiveFormsModule, MoneyPipe, LabelPipe, DatePipe],
  templateUrl: './partner-offers.component.html',
  styleUrl: './partner-offers.component.scss'
})
export class PartnerOffersComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly config = signal<OfferConfig | null>(null);
  readonly offers = signal<PartnerOffer[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly showForm = signal(false);
  readonly confirmDeleteId = signal<number | null>(null);
  readonly hotels = signal<Hotel[]>([]);
  readonly destinations = signal<Destination[]>([]);
  readonly showHotelForm = signal(false);
  readonly hotelError = signal<string | null>(null);

  readonly canPublish = computed(() => this.auth.user()?.partner?.status === 'ACTIVE');
  readonly hotelTypes = entries(HOTEL_TYPE_LABELS);
  readonly amenityOptions = Object.entries(AMENITY_LABELS).map(([value, label]) => ({ value, label }));

  form = new FormGroup<Record<string, FormControl>>({});

  readonly hotelForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    destinationId: new FormControl<number | null>(null, [Validators.required]),
    type: new FormControl('HOTEL', { nonNullable: true }),
    stars: new FormControl(3, { nonNullable: true }),
    locationLabel: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    imageUrl: new FormControl('', { nonNullable: true }),
    amenities: new FormControl<string[]>([], { nonNullable: true })
  });

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const config = configBySlug(params.get('type') ?? '') ?? null;
        this.config.set(config);
        this.closeForm();
        if (config) {
          this.load(config);
        }
      });
    this.api.destinations().subscribe({ next: (d) => this.destinations.set(d), error: () => undefined });
  }

  load(config: OfferConfig): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.partnerOffers(config.type).subscribe({
      next: (list) => {
        this.offers.set(list);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.loading.set(false);
      }
    });
    if (config.type === 'HOTEL') {
      this.loadHotels();
    }
  }

  loadHotels(): void {
    this.api.partnerHotels().subscribe({ next: (h) => this.hotels.set(h), error: () => undefined });
  }

  openCreate(): void {
    const config = this.config();
    if (!config) return;
    this.form = this.buildForm(config.fields, null);
    this.editingId.set(null);
    this.formError.set(null);
    this.showForm.set(true);
  }

  openEdit(offer: PartnerOffer): void {
    const config = this.config();
    if (!config) return;
    this.form = this.buildForm(config.fields, offer);
    this.editingId.set(offer.id);
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formError.set(null);
  }

  save(): void {
    const config = this.config();
    if (!config) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Complétez les champs obligatoires.');
      return;
    }
    const payload = this.toPayload(config.fields);
    const id = this.editingId();
    this.saving.set(true);
    this.formError.set(null);
    const request = id === null ? this.api.createOffer(config.type, payload) : this.api.updateOffer(config.type, id, payload);
    request.subscribe({
      next: (saved) => {
        this.offers.update((list) => (id === null ? [saved, ...list] : list.map((o) => (o.id === id ? saved : o))));
        this.saving.set(false);
        this.closeForm();
      },
      error: (e) => {
        this.saving.set(false);
        this.formError.set(errorMessage(e));
      }
    });
  }

  toggleActive(offer: PartnerOffer): void {
    const config = this.config();
    if (!config) return;
    this.api.setOfferActive(config.type, offer.id, !offer.active).subscribe({
      next: (saved) => this.offers.update((list) => list.map((o) => (o.id === saved.id ? saved : o))),
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  remove(offer: PartnerOffer): void {
    const config = this.config();
    if (!config) return;
    this.api.deleteOffer(config.type, offer.id).subscribe({
      next: () => {
        this.offers.update((list) => list.filter((o) => o.id !== offer.id));
        this.confirmDeleteId.set(null);
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  toggleAmenity(value: string): void {
    const control = this.hotelForm.controls.amenities;
    const current = control.value;
    control.setValue(current.includes(value) ? current.filter((a) => a !== value) : [...current, value]);
  }

  saveHotel(): void {
    if (this.hotelForm.invalid) {
      this.hotelForm.markAllAsTouched();
      this.hotelError.set('Indiquez au moins le nom et la destination de l\'hôtel.');
      return;
    }
    const v = this.hotelForm.getRawValue();
    this.api
      .createHotel({ ...v, stars: +v.stars, destinationId: Number(v.destinationId) })
      .subscribe({
        next: (hotel) => {
          this.hotels.update((list) => [...list, hotel].sort((a, b) => a.name.localeCompare(b.name)));
          this.form.get('hotelId')?.setValue(hotel.id);
          this.showHotelForm.set(false);
          this.hotelError.set(null);
          this.hotelForm.reset({ type: 'HOTEL', stars: 3, amenities: [] });
        },
        error: (e) => this.hotelError.set(errorMessage(e))
      });
  }

  cell(offer: PartnerOffer, column: ColumnDef): unknown {
    return offer[column.key];
  }

  asNumber(value: unknown): number {
    return Number(value);
  }

  asString(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  isInvalid(key: string): boolean {
    const c = this.form.get(key);
    return !!c && c.invalid && c.touched;
  }

  private buildForm(fields: FieldDef[], offer: PartnerOffer | null): FormGroup<Record<string, FormControl>> {
    const controls: Record<string, FormControl> = {};
    for (const f of fields) {
      let value: unknown = offer ? offer[f.key] : f.default ?? (f.type === 'checkbox' ? false : '');
      if (f.type === 'datetime' && typeof value === 'string') {
        value = value.slice(0, 16);
      }
      if (value === null || value === undefined) {
        value = f.type === 'checkbox' ? false : '';
      }
      const validators: ValidatorFn[] = [];
      if (f.required && f.type !== 'checkbox') validators.push(Validators.required);
      if (f.min !== undefined && f.type === 'number') validators.push(Validators.min(f.min));
      if (f.max !== undefined && f.type === 'number') validators.push(Validators.max(f.max));
      if (f.type === 'url') validators.push(Validators.pattern(/^$|^https?:\/\/\S+$/));
      controls[f.key] = new FormControl(value, validators);
    }
    return new FormGroup(controls);
  }

  private toPayload(fields: FieldDef[]): Record<string, unknown> {
    const raw = this.form.getRawValue();
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const value = raw[f.key];
      if (f.type === 'number' || f.type === 'hotel' || f.type === 'destination') {
        payload[f.key] = value === '' || value === null ? null : Number(value);
      } else if (f.type === 'checkbox') {
        payload[f.key] = !!value;
      } else if (typeof value === 'string') {
        const trimmed = value.trim();
        payload[f.key] = trimmed === '' ? null : UPPERCASE_KEYS.includes(f.key) ? trimmed.toUpperCase() : trimmed;
      } else {
        payload[f.key] = value;
      }
    }
    return payload;
  }
}
