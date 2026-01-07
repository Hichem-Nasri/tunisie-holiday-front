import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HostLayoutComponent } from './layout/host-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { MyListingsComponent } from './listings/my-listings/my-listings.component';
import { AddListingComponent } from './listings/add-listing/add-listing.component';
import { EditListingComponent } from './listings/edit-listing/edit-listing.component';
import { ListingDetailsComponent } from './listings/details-listing/listing-details.component';
import { MyReservationsComponent } from './reservations/my-reservations/my-reservations.component';

export const HOST_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  // 🔒 ROUTES PROTÉGÉES (LAYOUT + DASHBOARD)
  {
    path: '',
    component: HostLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'listings',
        component: MyListingsComponent,
      },
      {
        path: 'add-listing',
        component: AddListingComponent,
      },
      {
        path: 'edit-listing/:id',
        component: EditListingComponent,
      },
      {
        path: 'details-listing/:id',
        component: ListingDetailsComponent,
      },

       // ✅ Mes réservations
      {
        path: 'reservations',
        component: MyReservationsComponent,
      },
    ],
  },
];
