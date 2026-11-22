import { Routes } from '@angular/router';
import { adminGuard, partnerGuard } from './core/guards';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent), title: 'Tunisie-Holidays.com — Le comparateur du voyage en Tunisie' },
  { path: 'vols', loadComponent: () => import('./features/flights/flight-results.component').then((m) => m.FlightResultsComponent), title: 'Vols — Tunisie-Holidays.com' },
  { path: 'hotels', loadComponent: () => import('./features/hotels/hotel-results.component').then((m) => m.HotelResultsComponent), title: 'Hôtels — Tunisie-Holidays.com' },
  { path: 'voitures', loadComponent: () => import('./features/cars/car-results.component').then((m) => m.CarResultsComponent), title: 'Location de voitures — Tunisie-Holidays.com' },
  { path: 'locations', loadComponent: () => import('./features/rentals/rental-results.component').then((m) => m.RentalResultsComponent), title: 'Locations de vacances — Tunisie-Holidays.com' },
  { path: 'loisirs', loadComponent: () => import('./features/activities/activity-results.component').then((m) => m.ActivityResultsComponent), title: 'Loisirs — Tunisie-Holidays.com' },
  { path: 'connexion', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent), title: 'Connexion — Tunisie-Holidays.com' },
  { path: 'devenir-partenaire', loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent), title: 'Devenir partenaire — Tunisie-Holidays.com' },
  {
    path: 'partenaire',
    canActivate: [partnerGuard],
    loadComponent: () => import('./features/partner/partner-layout.component').then((m) => m.PartnerLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/partner/partner-dashboard.component').then((m) => m.PartnerDashboardComponent), title: 'Espace partenaire' },
      { path: 'offres/:type', loadComponent: () => import('./features/partner/partner-offers.component').then((m) => m.PartnerOffersComponent), title: 'Mes offres' },
      { path: 'profil', loadComponent: () => import('./features/partner/partner-profile.component').then((m) => m.PartnerProfileComponent), title: 'Mon profil' }
    ]
  },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent), title: 'Administration' },
  { path: '**', redirectTo: '' }
];
