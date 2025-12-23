import ApiRoutes from '@common/defs/api-routes';
import { Post, POST_STATUS } from '@modules/posts/defs/types';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Id } from '@common/defs/types';

export interface CreateOneInput {
  agent_id: Id;
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
  published_at?: string;
  image_id: Id;
  meta_title?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
  meta_description?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
}

export interface UpdateOneInput {
  agent_id: Id;
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
  published_at?: string;
  image_id: Id;
  meta_title?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
  meta_description?: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

const usePosts: UseItems<Post, CreateOneInput, UpdateOneInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.Posts;
  const useItemsHook = useItems<Post, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  return useItemsHook;
};

export default usePosts;
