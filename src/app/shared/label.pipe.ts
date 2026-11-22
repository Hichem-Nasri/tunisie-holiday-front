import { Pipe, PipeTransform } from '@angular/core';
import {
  ACTIVITY_LABELS, AMENITY_LABELS, BOARD_LABELS, CABIN_LABELS, CAR_CATEGORY_LABELS, HOTEL_TYPE_LABELS,
  OFFER_TYPE_LABELS, PARTNER_STATUS_LABELS, PARTNER_TYPE_LABELS, RENTAL_TYPE_LABELS, TRANSMISSION_LABELS
} from '../core/labels';

const DICTIONARIES: Record<string, Record<string, string>> = {
  activity: ACTIVITY_LABELS,
  amenity: AMENITY_LABELS,
  board: BOARD_LABELS,
  cabin: CABIN_LABELS,
  car: CAR_CATEGORY_LABELS,
  hotelType: HOTEL_TYPE_LABELS,
  offerType: OFFER_TYPE_LABELS,
  partnerStatus: PARTNER_STATUS_LABELS,
  partnerType: PARTNER_TYPE_LABELS,
  rental: RENTAL_TYPE_LABELS,
  transmission: TRANSMISSION_LABELS
};

@Pipe({ name: 'label', standalone: true })
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined, dictionary: string): string {
    if (!value) {
      return '';
    }
    return DICTIONARIES[dictionary]?.[value] ?? value;
  }
}
