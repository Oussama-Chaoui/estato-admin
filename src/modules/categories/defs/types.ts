import { CrudObject } from '@common/defs/types';

export interface Category extends CrudObject {
  name: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  slug: string;
  description?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
}
