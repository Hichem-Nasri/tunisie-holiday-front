import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const partnerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isPartner() ? true : inject(Router).createUrlTree(['/connexion']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin() ? true : inject(Router).createUrlTree(['/connexion']);
};
