import { CrudObject } from '@common/defs/types';

export interface Location extends CrudObject {
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}
