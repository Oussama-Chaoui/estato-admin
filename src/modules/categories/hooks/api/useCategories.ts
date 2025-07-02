import ApiRoutes from '@common/defs/api-routes';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Category } from '@modules/categories/defs/types';

export interface CreateOneInput {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateOneInput {
  name: string;
  slug: string;
  description?: string;
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

const useCategories: UseItems<Category, CreateOneInput, UpdateOneInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.Categories;
  const useItemsHook = useItems<Category, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  return useItemsHook;
};

export default useCategories;
