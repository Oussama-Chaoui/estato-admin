import { CrudObject, Id } from '@common/defs/types';

export interface Amenity extends CrudObject {
  id: Id;
  name: string;
  icon: string;
}
