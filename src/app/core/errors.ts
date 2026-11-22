import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './models';

export function errorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Le serveur est injoignable. Vérifiez votre connexion.';
    }
    const body = error.error as ApiError | null;
    if (body?.message) {
      return body.details?.length ? `${body.message} : ${body.details.join(' ; ')}` : body.message;
    }
  }
  return fallback;
}
