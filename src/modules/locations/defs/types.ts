import { CrudObject, Id } from '@common/defs/types';

export interface Region extends CrudObject {
  names: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  slug: string;
  description?: string;
}

export interface City extends CrudObject {
  regionId: Id;
  names: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  slug: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  region?: Region;
}

export interface Location extends CrudObject {
  cityId: Id;
  streetAddress: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  latitude: number;
  longitude: number;
  city?: City;
}
