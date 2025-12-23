import { CrudObject } from '@common/defs/types';

export interface Tag extends CrudObject {
  name: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  slug: string;
}
