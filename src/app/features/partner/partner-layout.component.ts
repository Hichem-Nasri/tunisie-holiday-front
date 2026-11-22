import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ALLOWED_TYPES, OFFER_CONFIGS } from './offer-config';
import { LabelPipe } from '../../shared/label.pipe';

@Component({
  selector: 'th-partner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LabelPipe],
  template: `
    <div class="container layout">
      <nav class="card side" aria-label="Espace partenaire">
        <div class="who">
          <strong>{{ partner()?.name }}</strong>
          <span class="muted small">{{ partner()?.type | label: 'partnerType' }}</span>
        </div>
        <a routerLink="/partenaire" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Tableau de bord</a>
        @for (c of configs(); track c.slug) {
          <a [routerLink]="['/partenaire/offres', c.slug]" routerLinkActive="active">{{ c.title }}</a>
        }
        <a routerLink="/partenaire/profil" routerLinkActive="active">Mon profil</a>
      </nav>
      <div class="content">
        @if (partner()?.status === 'PENDING') {
          <div class="alert alert-info" role="status">Votre compte est en attente de validation par notre équipe. Vous pourrez publier vos offres dès son activation.</div>
        }
        @if (partner()?.status === 'SUSPENDED') {
          <div class="alert alert-error" role="status">Votre compte est suspendu. Vos offres ne sont plus visibles. Contactez-nous pour le réactiver.</div>
        }
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; padding-top: 32px; padding-bottom: 48px; }
    .side { flex: 1 1 220px; max-width: 260px; padding: 12px; display: flex; flex-direction: column; gap: 2px; }
    .who { display: flex; flex-direction: column; padding: 8px 12px 12px; border-bottom: 1px solid var(--line); margin-bottom: 6px; }
    .side a { padding: 10px 12px; border-radius: 10px; text-decoration: none; color: var(--navy); font-weight: 600; font-size: 15px; }
    .side a:hover { background: var(--bg); }
    .side a.active { background: var(--blue-soft); color: var(--blue-dark); }
    .content { flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
    @media (max-width: 720px) { .side { max-width: none; } }
  `]
})
export class PartnerLayoutComponent {
  private readonly auth = inject(AuthService);
  readonly partner = computed(() => this.auth.user()?.partner);
  readonly configs = computed(() => {
    const type = this.partner()?.type;
    const allowed = type ? ALLOWED_TYPES[type] : [];
    return OFFER_CONFIGS.filter((c) => allowed.includes(c.type));
  });
}
