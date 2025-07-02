import ApiRoutes from '@common/defs/api-routes';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Tag } from '@modules/tags/defs/types';

export interface CreateOneInput {
  name: string;
  slug: string;
}

export interface UpdateOneInput {
  name: string;
  slug: string;
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

const useTags: UseItems<Tag, CreateOneInput, UpdateOneInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.Tags;
  const useItemsHook = useItems<Tag, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  return useItemsHook;
};

export default useTags;
