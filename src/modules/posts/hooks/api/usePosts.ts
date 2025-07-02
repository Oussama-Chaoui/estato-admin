import ApiRoutes from '@common/defs/api-routes';
import { Post } from '@modules/posts/defs/types';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Id } from '@common/defs/types';

export interface CreateOneInput {
  agent_id: Id;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: string;
  published_at?: string;
  image_id: Id;
  meta_title?: string;
  meta_description?: string;
}

export interface UpdateOneInput {
  agent_id: Id;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: string;
  published_at?: string;
  image_id: Id;
  meta_title?: string;
  meta_description?: string;
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
