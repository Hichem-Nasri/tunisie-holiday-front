import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Partner } from '../../core/models';
import { errorMessage } from '../../core/errors';
import { LabelPipe } from '../../shared/label.pipe';

@Component({
  selector: 'th-partner-profile',
  standalone: true,
  imports: [ReactiveFormsModule, LabelPipe],
  template: `
    <h1>Mon profil</h1>
    @if (partner(); as p) {
      <form class="card form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="meta">
          <span class="badge badge-blue">{{ p.type | label: 'partnerType' }}</span>
          <span class="badge" [class.badge-green]="p.status === 'ACTIVE'" [class.badge-orange]="p.status === 'PENDING'" [class.badge-red]="p.status === 'SUSPENDED'">{{ p.status | label: 'partnerStatus' }}</span>
          <span class="muted small">{{ p.email }}</span>
        </div>
        @if (message()) {
          <div class="alert" [class.alert-success]="!isError()" [class.alert-error]="isError()" role="status">{{ message() }}</div>
        }
        <div class="grid">
          <div class="field"><label for="name">Nom de l'établissement</label><input id="name" formControlName="name"></div>
          <div class="field"><label for="phone">Téléphone</label><input id="phone" type="tel" formControlName="phone"></div>
          <div class="field"><label for="city">Ville</label><input id="city" formControlName="city"></div>
          <div class="field"><label for="website">Site web</label><input id="website" type="url" formControlName="website"></div>
          <div class="field wide"><label for="logoUrl">Logo (URL)</label><input id="logoUrl" type="url" formControlName="logoUrl"></div>
          <div class="field wide"><label for="description">Présentation</label><textarea id="description" formControlName="description"></textarea></div>
        </div>
        <div class="actions"><button type="submit" class="btn btn-primary" [disabled]="saving()">Enregistrer</button></div>
      </form>
    } @else {
      <div class="skeleton" style="height: 300px"></div>
    }
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 900; }
    .form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
    .wide { grid-column: 1 / -1; }
    .actions { display: flex; justify-content: flex-end; }
  `]
})
export class PartnerProfileComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly partner = signal<Partner | null>(null);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly isError = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    phone: [''],
    city: [''],
    website: [''],
    logoUrl: [''],
    description: ['']
  });

  constructor() {
    this.api.partnerMe().subscribe({
      next: (p) => {
        this.partner.set(p);
        this.form.patchValue({
          name: p.name,
          phone: p.phone ?? '',
          city: p.city ?? '',
          website: p.website ?? '',
          logoUrl: p.logoUrl ?? '',
          description: p.description ?? ''
        });
      },
      error: (e) => this.show(errorMessage(e), true)
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.show('Le nom de l\'établissement est obligatoire.', true);
      return;
    }
    this.saving.set(true);
    this.api.updatePartnerMe(this.form.getRawValue()).subscribe({
      next: (p) => {
        this.partner.set(p);
        this.auth.updatePartner(p);
        this.saving.set(false);
        this.show('Profil enregistré.', false);
      },
      error: (e) => {
        this.saving.set(false);
        this.show(errorMessage(e), true);
      }
    });
  }

  private show(message: string, error: boolean): void {
    this.message.set(message);
    this.isError.set(error);
  }
}
