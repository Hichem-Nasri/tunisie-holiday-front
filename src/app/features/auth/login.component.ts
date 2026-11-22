import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';

@Component({
  selector: 'th-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page container">
      <form class="card auth-card" (ngSubmit)="submit()" novalidate>
        <h1>Espace partenaire</h1>
        <p class="muted">Connectez-vous pour gérer vos offres et suivre vos statistiques.</p>
        @if (error()) {
          <div class="alert alert-error" role="alert">{{ error() }}</div>
        }
        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" name="email" autocomplete="email" required [(ngModel)]="email">
        </div>
        <div class="field">
          <label for="password">Mot de passe</label>
          <input id="password" type="password" name="password" autocomplete="current-password" required [(ngModel)]="password">
        </div>
        <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">{{ loading() ? 'Connexion…' : 'Se connecter' }}</button>
        <p class="muted small center">Pas encore partenaire ? <a routerLink="/devenir-partenaire">Créer un compte</a></p>
      </form>
    </div>
  `,
  styleUrl: './auth.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl(this.auth.homeRoute());
    }
  }

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set('Renseignez votre email et votre mot de passe.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => this.router.navigateByUrl(this.auth.homeRoute()),
      error: (e) => {
        this.loading.set(false);
        this.error.set(errorMessage(e, 'Connexion impossible.'));
      }
    });
  }
}
