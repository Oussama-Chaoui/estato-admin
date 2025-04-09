import { CrudObject, Id } from '@common/defs/types';

export enum PROPERTY_STATUS {
  FOR_SALE = 'for_sale',
  FOR_RENT = 'for_rent',
  SOLD = 'sold',
  RENTED = 'rented',
}

export enum PROPERTY_TYPE {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  STUDIO = 'studio',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  GARAGE = 'garage',
  MANSION = 'mansion',
}

export interface Location {
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Property extends CrudObject {
  title: string;
  description: string;
  price: number;
  type: PROPERTY_TYPE;
  status: PROPERTY_STATUS;
  locationId: Id;
  streetAddress: string;
  yearBuilt: number;
  lotSize: number;
  hasVR: boolean;
}