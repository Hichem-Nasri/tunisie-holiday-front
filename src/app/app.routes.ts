import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'host/login',
    pathMatch: 'full'
  },
  {
    path: 'host',
    loadChildren: () =>
      import('./host/host.routes').then(m => m.HOST_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'host/login'
  }
];
