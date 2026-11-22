import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { PartnerStats } from '../../core/models';
import { errorMessage } from '../../core/errors';
import { ClickChartComponent } from '../../shared/click-chart.component';
import { LabelPipe } from '../../shared/label.pipe';
import { ALLOWED_TYPES, OFFER_CONFIGS } from './offer-config';

@Component({
  selector: 'th-partner-dashboard',
  standalone: true,
  imports: [RouterLink, ClickChartComponent, LabelPipe, LowerCasePipe],
  template: `
    <h1 class="page-title">Bonjour {{ auth.user()?.fullName }}</h1>
    @if (error()) {
      <div class="alert alert-error" role="alert">{{ error() }}</div>
    }
    @if (stats(); as s) {
      <div class="kpis">
        <div class="card kpi"><span class="muted small">Clics vers votre site (30 j)</span><strong>{{ s.clicks30d }}</strong></div>
        @for (c of configs(); track c.type) {
          <a class="card kpi" [routerLink]="['/partenaire/offres', c.slug]"><span class="muted small">Offres {{ c.title | lowercase }}</span><strong>{{ s.offers[c.type] || 0 }}</strong></a>
        }
      </div>
      <section class="card block">
        <h2>Clics par jour</h2>
        <th-click-chart [days]="s.perDay" />
      </section>
      @if (s.perType.length) {
        <section class="card block">
          <h2>Clics par type d'offre</h2>
          <ul class="types">
            @for (t of s.perType; track t.type) {
              <li><span>{{ t.type | label: 'offerType' }}</span><strong>{{ t.clicks }}</strong></li>
            }
          </ul>
        </section>
      }
    } @else if (!error()) {
      <div class="skeleton" style="height: 260px"></div>
    }
  `,
  styles: [`
    .page-title { font-size: 28px; font-weight: 900; }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
    .kpi { padding: 18px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: var(--navy); }
    .kpi strong { font: 900 30px var(--font-title); }
    a.kpi:hover { border-color: var(--blue); }
    .block { padding: 20px; }
    .block h2 { font-size: 18px; font-weight: 800; margin-bottom: 12px; }
    .types { list-style: none; margin: 0; padding: 0; }
    .types li { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid var(--line); }
  `]
})
export class PartnerDashboardComponent {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly stats = signal<PartnerStats | null>(null);
  readonly error = signal<string | null>(null);
  readonly configs = computed(() => {
    const type = this.auth.user()?.partner?.type;
    const allowed = type ? ALLOWED_TYPES[type] : [];
    return OFFER_CONFIGS.filter((c) => allowed.includes(c.type));
  });

  constructor() {
    this.auth.refreshMe();
    this.api.partnerStats().subscribe({
      next: (s) => this.stats.set(s),
      error: (e) => this.error.set(errorMessage(e))
    });
  }
}
