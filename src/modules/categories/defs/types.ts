import { CrudObject } from '@common/defs/types';

export interface Category extends CrudObject {
  name: string;
  slug: string;
  description?: string;
}
