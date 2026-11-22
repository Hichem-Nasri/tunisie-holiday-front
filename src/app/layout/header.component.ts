import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CurrencyService } from '../core/currency.service';

@Component({
  selector: 'th-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container bar">
        <a routerLink="/" class="logo" aria-label="Tunisie-Holidays.com, accueil">
          <img src="assets/img/logo.jpg" alt="Tunisie-Holidays.com" width="198" height="66">
        </a>
        <button type="button" class="menu-toggle" [attr.aria-expanded]="open()" aria-controls="main-nav" (click)="open.set(!open())">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          <span class="sr-only">Menu</span>
        </button>
        <nav id="main-nav" class="nav" [class.open]="open()" aria-label="Principal" (click)="open.set(false)">
          <a routerLink="/vols" routerLinkActive="active">Vols</a>
          <a routerLink="/hotels" routerLinkActive="active">Hôtels</a>
          <a routerLink="/voitures" routerLinkActive="active">Location de voitures</a>
          <a routerLink="/locations" routerLinkActive="active">Locations de vacances</a>
          <a routerLink="/loisirs" routerLinkActive="active">Loisirs</a>
        </nav>
        <div class="actions">
          <label class="sr-only" for="currency">Devise</label>
          <select id="currency" class="currency" [value]="currency.current()" (change)="onCurrency($event)">
            @for (c of currency.currencies(); track c.code) {
              <option [value]="c.code" [selected]="c.code === currency.current()">{{ c.code }} · {{ c.symbol }}</option>
            }
          </select>
          @if (auth.isLoggedIn()) {
            <a class="btn btn-blue btn-sm" [routerLink]="auth.homeRoute()">{{ auth.isAdmin() ? 'Administration' : 'Mon espace' }}</a>
            <button type="button" class="btn btn-ghost" (click)="auth.logout()">Déconnexion</button>
          } @else {
            <a class="btn btn-blue btn-sm" routerLink="/connexion">Espace partenaire</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header { background: #fff; border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 20; }
    .bar { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; padding-top: 8px; padding-bottom: 8px; }
    .logo img { height: 58px; width: auto; }
    .nav { display: flex; flex-wrap: wrap; gap: 4px; flex: 1 1 auto; }
    .nav a { padding: 10px 14px; border-radius: 10px; font-weight: 600; font-size: 15px; color: var(--navy); text-decoration: none; }
    .nav a:hover { background: var(--bg); }
    .nav a.active { background: var(--blue-soft); color: var(--blue-dark); font-weight: 700; }
    .actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .currency { font: 600 14px var(--font-body); color: var(--navy); border: 1.5px solid var(--field); border-radius: 10px; padding: 0 10px; min-height: 44px; background: #fff; }
    .menu-toggle { display: none; margin-left: auto; width: 44px; height: 44px; border: 1.5px solid var(--field); border-radius: 10px; background: #fff; color: var(--navy); align-items: center; justify-content: center; }
    @media (max-width: 960px) {
      .menu-toggle { display: inline-flex; }
      .nav { display: none; order: 3; flex-basis: 100%; flex-direction: column; }
      .nav.open { display: flex; }
      .actions { order: 4; flex-basis: 100%; }
      .logo img { height: 48px; }
    }
  `]
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly currency = inject(CurrencyService);
  readonly open = signal(false);

  onCurrency(event: Event): void {
    this.currency.set((event.target as HTMLSelectElement).value);
  }
}
