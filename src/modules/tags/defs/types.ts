import { CrudObject } from '@common/defs/types';

export interface Tag extends CrudObject {
  name: string;
  slug: string;
}
