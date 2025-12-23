import { CrudObject, Id } from '@common/defs/types';

export interface Post extends CrudObject {
  agentId: Id;
  title: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  slug: string;
  excerpt?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
  content: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  status: POST_STATUS;
  publishedAt?: string;
  imageId: Id;
  metaTitle?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
  metaDescription?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
}

export enum POST_STATUS {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
