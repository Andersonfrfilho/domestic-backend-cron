import {
  PHONE_AREA_END,
  PHONE_AREA_START,
  PHONE_COUNTRY_END,
  PHONE_COUNTRY_START,
  PHONE_NUMBER_START,
  PHONE_TOTAL_LENGTH,
} from '../constants/phone.constant';
import { ParsedPhone } from '../interfaces/phone.interface';

export const parsePhone = (phone: string): ParsedPhone => {
  const clean = phone.replace(/\D/g, '');

  if (clean.length !== PHONE_TOTAL_LENGTH) {
    // TODO: replace with PhoneErrorFactory.invalidFormat once factory is created
    throw new Error(`Invalid phone format: "${phone}"`);
  }

  return {
    country: `+${clean.substring(PHONE_COUNTRY_START, PHONE_COUNTRY_END)}`,
    area: clean.substring(PHONE_AREA_START, PHONE_AREA_END),
    number: clean.substring(PHONE_NUMBER_START),
  };
};
