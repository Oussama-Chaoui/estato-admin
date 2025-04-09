import ApiRoutes from '@common/defs/api-routes';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Id } from '@common/defs/types';
import { Property } from '@modules/properties/defs/types';

export interface CreateOneInput {
  title: string;
  description: string;
  price: number;
  propertyType: string;
  status: string;
  locationId: Id;
  streetAddress: string;
  yearBuilt: number;
  lotSize: number;
  hasVR: boolean;
}

export interface UpdateOneInput {
  title: string;
  description: string;
  price: number;
  propertyType: string;
  status: string;
  locationId: Id;
  streetAddress: string;
  yearBuilt: number;
  lotSize: number;
  hasVR: boolean;
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

const useProperties: UseItems<Property, CreateOneInput, UpdateOneInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.Properties;
  const useItemsHook = useItems<Property, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  return useItemsHook;
};

export default useProperties;
