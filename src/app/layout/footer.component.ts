import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'th-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container cols">
        <div>
          <div class="brand">Tunisie-Holidays<span>.com</span></div>
          <p>Le moteur de recherche du voyage en Tunisie : vols, hôtels, voitures, locations et loisirs.</p>
        </div>
        <nav aria-label="Rechercher">
          <strong>Rechercher</strong>
          <a routerLink="/vols">Vols</a>
          <a routerLink="/hotels">Hôtels</a>
          <a routerLink="/voitures">Location de voitures</a>
          <a routerLink="/locations">Locations de vacances</a>
          <a routerLink="/loisirs">Loisirs</a>
        </nav>
        <nav aria-label="Partenaires">
          <strong>Partenaires</strong>
          <a routerLink="/devenir-partenaire">Devenir partenaire</a>
          <a routerLink="/connexion">Espace partenaire</a>
        </nav>
        <div>
          <strong>Comment ça marche ?</strong>
          <p>Tunisie-Holidays compare les offres de ses partenaires. La réservation se fait directement sur le site du partenaire choisi.</p>
        </div>
      </div>
      <div class="container copy">© {{ year }} Tunisie-Holidays.com</div>
    </footer>
  `,
  styles: [`
    .footer { background: var(--navy); color: #C9D7EE; margin-top: 56px; }
    .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; padding-top: 48px; padding-bottom: 32px; font-size: 14px; }
    .cols nav { display: flex; flex-direction: column; gap: 10px; }
    strong { color: #fff; display: block; margin-bottom: 4px; }
    a { color: #C9D7EE; text-decoration: none; }
    a:hover { color: #fff; text-decoration: underline; }
    p { line-height: 1.6; margin: 10px 0 0; }
    .brand { font: 900 22px var(--font-title); color: #fff; }
    .brand span { color: var(--orange); }
    .copy { border-top: 1px solid rgba(255,255,255,.15); padding-top: 16px; padding-bottom: 28px; font-size: 13px; }
  `]
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
