import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';
import { PARTNER_TYPE_LABELS, entries } from '../../core/labels';

@Component({
  selector: 'th-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page container">
      <form class="card auth-card wide" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Devenir partenaire</h1>
        <p class="muted">Agences, hôtels, loueurs, propriétaires et prestataires : publiez vos offres et recevez des visiteurs qualifiés. Votre compte sera activé après vérification par notre équipe.</p>
        @if (error()) {
          <div class="alert alert-error" role="alert">{{ error() }}</div>
        }
        <div class="grid">
          <div class="field">
            <label for="partnerName">Nom de l'établissement</label>
            <input id="partnerName" formControlName="partnerName" autocomplete="organization">
          </div>
          <div class="field">
            <label for="type">Activité</label>
            <select id="type" formControlName="type">
              @for (t of types; track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label for="contactName">Nom du contact</label>
            <input id="contactName" formControlName="contactName" autocomplete="name">
          </div>
          <div class="field">
            <label for="city">Ville</label>
            <input id="city" formControlName="city">
          </div>
          <div class="field">
            <label for="email">Email professionnel</label>
            <input id="email" type="email" formControlName="email" autocomplete="email">
          </div>
          <div class="field">
            <label for="phone">Téléphone</label>
            <input id="phone" type="tel" formControlName="phone" autocomplete="tel">
          </div>
          <div class="field">
            <label for="website">Site web</label>
            <input id="website" type="url" formControlName="website" placeholder="https://">
          </div>
          <div class="field">
            <label for="password">Mot de passe (8 caractères min.)</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password">
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">{{ loading() ? 'Création…' : 'Créer mon compte partenaire' }}</button>
        <p class="muted small center">Déjà partenaire ? <a routerLink="/connexion">Se connecter</a></p>
      </form>
    </div>
  `,
  styleUrl: './auth.scss'
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly types = entries(PARTNER_TYPE_LABELS);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    partnerName: ['', [Validators.required, Validators.maxLength(150)]],
    type: ['AGENCY', Validators.required],
    contactName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: [''],
    website: [''],
    city: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Complétez les champs obligatoires : nom, contact, email valide et mot de passe de 8 caractères.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.registerPartner(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/partenaire'),
      error: (e) => {
        this.loading.set(false);
        this.error.set(errorMessage(e, 'Inscription impossible.'));
      }
    });
  }
}
