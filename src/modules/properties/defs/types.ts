import { CrudObject, Id } from '@common/defs/types';
import { Agent } from '@modules/agents/defs/types';
import { Amenity } from '@modules/amenities/defs/types';
import { Location } from '@modules/locations/defs/types';
import { Upload } from '@modules/uploads/defs/types';
import { Client } from '@modules/users/defs/types';

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

export interface Feature extends CrudObject {
  id: Id;
  propertyId: Id;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  pool: boolean;
  garden: boolean;
  floors: number;
  area: number;
}

export interface Description extends CrudObject {
  id: Id;
  propertyId: Id;
  content: string;
  ordering: number;
}

export interface Rental extends CrudObject {
  propertyId: Id;
  clientId: Id;
  agentId: Id;
  startDate: Date;
  endDate: Date;
  price: number;
  renter?: Client;
  agent?: Agent;
  details?: string;
}

export interface PropertyImage {
  propertyId: Id;
  imageId: Id;
  ordering: number;
  caption: string | null;
  upload: Upload;
}

export interface Property extends CrudObject {
  title: string;
  description: string;
  salePrice: number;
  monthlyPrice: number;
  dailyPrice: number;
  dailyPriceEnabled: boolean;
  monthlyPriceEnabled: boolean;
  currency: string;
  type: PROPERTY_TYPE;
  status: PROPERTY_STATUS;
  locationId: Id;
  streetAddress: string;
  yearBuilt: number;
  lotSize: number;
  hasVR: boolean;
  features: Feature;
  amenities: Amenity[];
  agents: Agent[];
  location: Location;
  descriptions: Description[];
  images: PropertyImage[];
  rental?: Rental[];
}
