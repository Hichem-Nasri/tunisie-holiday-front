import { Pipe, PipeTransform } from '@angular/core';

const formatters = new Map<string, Intl.NumberFormat>();

@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'TND', decimals = 0): string {
    if (value === null || value === undefined) {
      return '';
    }
    const key = `${currency}-${decimals}`;
    let formatter = formatters.get(key);
    if (!formatter) {
      try {
        formatter = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      } catch {
        formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals });
      }
      formatters.set(key, formatter);
    }
    return formatter.format(value);
  }
}
