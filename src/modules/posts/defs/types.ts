import { CrudObject, Id } from '@common/defs/types';

export interface Post extends CrudObject {
  agentId: Id;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: POST_STATUS;
  publishedAt?: string;
  imageId: Id;
  metaTitle?: string;
  metaDescription?: string;
}

export enum POST_STATUS {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
