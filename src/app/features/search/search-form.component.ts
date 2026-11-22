import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/api.service';
import { Airport, Destination, PickupLocation } from '../../core/models';
import { addDays, shiftDate } from '../../core/dates';
import { CABIN_LABELS, entries } from '../../core/labels';

export type SearchTab = 'vols' | 'hotels' | 'voitures' | 'locations' | 'loisirs';

interface PlaceOption {
  value: string;
  label: string;
}

@Component({
  selector: 'th-search-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss'
})
export class SearchFormComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly initialTab = input<SearchTab>('vols');
  readonly compact = input(false);
  readonly query = input<Record<string, string>>({});

  readonly tabs: { id: SearchTab; label: string }[] = [
    { id: 'vols', label: 'Vols' },
    { id: 'hotels', label: 'Hôtels' },
    { id: 'voitures', label: 'Voitures' },
    { id: 'locations', label: 'Locations de vacances' },
    { id: 'loisirs', label: 'Loisirs' }
  ];
  readonly cabins = entries(CABIN_LABELS);
  readonly tab = signal<SearchTab>('vols');
  readonly error = signal<string | null>(null);
  readonly originOptions = signal<PlaceOption[]>([]);
  readonly destinationOptions = signal<PlaceOption[]>([]);
  readonly destinations = signal<Destination[]>([]);
  readonly pickupLocations = signal<PickupLocation[]>([]);
  readonly minDate = addDays(0);

  flight = {
    tripType: 'rt',
    origin: 'PAR',
    destination: 'DJE',
    departureDate: addDays(30),
    returnDate: addDays(37),
    adults: 1,
    cabin: 'ECONOMY'
  };
  hotel = { q: 'Hammamet', checkIn: addDays(30), checkOut: addDays(37), adults: 2, children: 0, rooms: 1 };
  car = { location: 'TUN', pickupDate: addDays(30), pickupTime: '10:00', dropoffDate: addDays(37), dropoffTime: '10:00', driverAge: 30 };
  rental = { q: 'Hammamet', checkIn: addDays(30), checkOut: addDays(37), guests: 4 };
  activity = { q: 'Tozeur', date: addDays(30), participants: 2 };

  private readonly originInput = new Subject<string>();
  private readonly destinationInput = new Subject<string>();

  constructor() {
    this.originInput
      .pipe(debounceTime(250), distinctUntilChanged(), switchMap((q) => this.lookup(q)), takeUntilDestroyed())
      .subscribe((list) => this.originOptions.set(list));
    this.destinationInput
      .pipe(debounceTime(250), distinctUntilChanged(), switchMap((q) => this.lookup(q)), takeUntilDestroyed())
      .subscribe((list) => this.destinationOptions.set(list));
  }

  ngOnInit(): void {
    this.tab.set(this.initialTab());
    this.applyQuery(this.query());
    this.api.destinations().subscribe({ next: (d) => this.destinations.set(d), error: () => undefined });
    this.api.carLocations().subscribe({ next: (l) => this.pickupLocations.set(l), error: () => undefined });
    this.lookup('').subscribe((list) => {
      this.originOptions.set(list);
      this.destinationOptions.set(list);
    });
    this.lookup('Paris').subscribe((list) => this.originOptions.set(list));
  }

  selectTab(tab: SearchTab): void {
    this.tab.set(tab);
    this.error.set(null);
  }

  onOriginInput(value: string): void {
    this.originInput.next(value);
  }

  onDestinationInput(value: string): void {
    this.destinationInput.next(value);
  }

  swap(): void {
    const o = this.flight.origin;
    this.flight.origin = this.flight.destination;
    this.flight.destination = o;
    const opts = this.originOptions();
    this.originOptions.set(this.destinationOptions());
    this.destinationOptions.set(opts);
  }

  onDepartureChange(): void {
    if (this.flight.returnDate <= this.flight.departureDate) {
      this.flight.returnDate = shiftDate(this.flight.departureDate, 7);
    }
  }

  onCheckInChange(target: { checkIn: string; checkOut: string }): void {
    if (target.checkOut <= target.checkIn) {
      target.checkOut = shiftDate(target.checkIn, 7);
    }
  }

  submit(): void {
    this.error.set(null);
    switch (this.tab()) {
      case 'vols':
        return this.submitFlight();
      case 'hotels':
        return this.submitHotel();
      case 'voitures':
        return this.submitCar();
      case 'locations':
        return this.submitRental();
      case 'loisirs':
        return this.submitActivity();
    }
  }

  private submitFlight(): void {
    const origin = this.code(this.flight.origin);
    const destination = this.code(this.flight.destination);
    if (!origin || !destination) {
      this.error.set('Choisissez un aéroport ou une ville de départ et d\'arrivée (code à 3 lettres, ex. TUN).');
      return;
    }
    if (origin === destination) {
      this.error.set('Le départ et l\'arrivée doivent être différents.');
      return;
    }
    if (!this.flight.departureDate) {
      this.error.set('Indiquez une date de départ.');
      return;
    }
    const roundTrip = this.flight.tripType === 'rt';
    if (roundTrip && (!this.flight.returnDate || this.flight.returnDate < this.flight.departureDate)) {
      this.error.set('La date de retour doit suivre la date de départ.');
      return;
    }
    this.router.navigate(['/vols'], {
      queryParams: {
        origin,
        destination,
        departureDate: this.flight.departureDate,
        returnDate: roundTrip ? this.flight.returnDate : null,
        adults: this.flight.adults,
        cabin: this.flight.cabin
      }
    });
  }

  private submitHotel(): void {
    if (!this.validStay(this.hotel.checkIn, this.hotel.checkOut)) {
      return;
    }
    this.router.navigate(['/hotels'], {
      queryParams: { q: this.hotel.q || null, checkIn: this.hotel.checkIn, checkOut: this.hotel.checkOut, adults: this.hotel.adults, children: this.hotel.children, rooms: this.hotel.rooms }
    });
  }

  private submitCar(): void {
    const pickupAt = `${this.car.pickupDate}T${this.car.pickupTime}`;
    const dropoffAt = `${this.car.dropoffDate}T${this.car.dropoffTime}`;
    if (!this.car.location) {
      this.error.set('Choisissez un lieu de prise en charge.');
      return;
    }
    if (dropoffAt <= pickupAt) {
      this.error.set('La restitution doit suivre la prise en charge.');
      return;
    }
    this.router.navigate(['/voitures'], { queryParams: { location: this.car.location, pickupAt, dropoffAt, driverAge: this.car.driverAge } });
  }

  private submitRental(): void {
    if (!this.validStay(this.rental.checkIn, this.rental.checkOut)) {
      return;
    }
    this.router.navigate(['/locations'], {
      queryParams: { q: this.rental.q || null, checkIn: this.rental.checkIn, checkOut: this.rental.checkOut, guests: this.rental.guests }
    });
  }

  private submitActivity(): void {
    this.router.navigate(['/loisirs'], {
      queryParams: { q: this.activity.q || null, date: this.activity.date || null, participants: this.activity.participants }
    });
  }

  private validStay(checkIn: string, checkOut: string): boolean {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      this.error.set('La date de départ doit suivre la date d\'arrivée.');
      return false;
    }
    return true;
  }

  private code(value: string): string | null {
    const v = (value ?? '').trim().toUpperCase();
    const match = v.match(/\(([A-Z]{3})\)\s*$/) ?? v.match(/^([A-Z]{3})$/);
    return match ? match[1] : null;
  }

  private lookup(q: string) {
    return this.api.airports(q).pipe(
      catchError(() => of([] as Airport[])),
      switchMap((airports) => of(this.toOptions(airports)))
    );
  }

  private toOptions(airports: Airport[]): PlaceOption[] {
    const options: PlaceOption[] = [];
    const cities = new Map<string, Airport[]>();
    airports.forEach((a) => cities.set(a.cityCode, [...(cities.get(a.cityCode) ?? []), a]));
    cities.forEach((list, cityCode) => {
      if (list.length > 1 || list[0].code !== cityCode) {
        options.push({ value: cityCode, label: `${list[0].city} — tous les aéroports` });
      }
      list.forEach((a) => options.push({ value: a.code, label: `${a.city} — ${a.name}` }));
    });
    return options;
  }

  private applyQuery(q: Record<string, string>): void {
    const num = (v: string | undefined, d: number) => (v && !isNaN(+v) ? +v : d);
    switch (this.initialTab()) {
      case 'vols':
        this.flight = {
          tripType: q['origin'] && !q['returnDate'] ? 'ow' : 'rt',
          origin: q['origin'] ?? this.flight.origin,
          destination: q['destination'] ?? this.flight.destination,
          departureDate: q['departureDate'] ?? this.flight.departureDate,
          returnDate: q['returnDate'] ?? shiftDate(q['departureDate'] ?? this.flight.departureDate, 7),
          adults: num(q['adults'], 1),
          cabin: q['cabin'] ?? 'ECONOMY'
        };
        break;
      case 'hotels':
        this.hotel = {
          q: q['q'] ?? this.hotel.q,
          checkIn: q['checkIn'] ?? this.hotel.checkIn,
          checkOut: q['checkOut'] ?? this.hotel.checkOut,
          adults: num(q['adults'], 2),
          children: num(q['children'], 0),
          rooms: num(q['rooms'], 1)
        };
        break;
      case 'voitures':
        this.car = {
          location: q['location'] ?? this.car.location,
          pickupDate: q['pickupAt']?.slice(0, 10) ?? this.car.pickupDate,
          pickupTime: q['pickupAt']?.slice(11, 16) ?? this.car.pickupTime,
          dropoffDate: q['dropoffAt']?.slice(0, 10) ?? this.car.dropoffDate,
          dropoffTime: q['dropoffAt']?.slice(11, 16) ?? this.car.dropoffTime,
          driverAge: num(q['driverAge'], 30)
        };
        break;
      case 'locations':
        this.rental = {
          q: q['q'] ?? this.rental.q,
          checkIn: q['checkIn'] ?? this.rental.checkIn,
          checkOut: q['checkOut'] ?? this.rental.checkOut,
          guests: num(q['guests'], 4)
        };
        break;
      case 'loisirs':
        this.activity = { q: q['q'] ?? this.activity.q, date: q['date'] ?? this.activity.date, participants: num(q['participants'], 2) };
        break;
    }
  }
}
