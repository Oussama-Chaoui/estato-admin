import ApiRoutes from '@common/defs/api-routes';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Id } from '@common/defs/types';
import { Property } from '@modules/properties/defs/types';

export interface CreateOneInput {
  title: string;
  description: string;
  monthlyPrice: number;
  salePrice: number;
  dailyPrice: number;
  dailyPriceEnabled: boolean;
  currency: string;
  monthlyPriceEnabled: boolean;
  type: string;
  status: string;
  locationId: Id;
  streetAddress: string;
  yearBuilt: number;
  lotSize: number;
  hasVR: boolean;
  agentIds: Id[];
  amenityIds: Id[];
  images: {
    imageId: Id;
    caption: string;
    ordering: number;
    /** client-only preview URL – server will ignore */
    preview?: string;
  }[];
  features: {
    id: Id;
    bedrooms: number;
    bathrooms: number;
    area: number;
    garages: number;
    floors: number;
    pool: boolean;
    garden: boolean;
  };
  location: {
    id: Id;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

export interface UpdateOneInput {
  title: string;
  description: string;
  monthlyPrice: number;
  salePrice: number;
  dailyPrice: number;
  dailyPriceEnabled: boolean;
  currency: string;
  monthlyPriceEnabled: boolean;
  type: string;
  status: string;
  locationId: Id;
  streetAddress: string;
  yearBuilt: number;
  lotSize: number;
  hasVR: boolean;
  agentIds: Id[];
  amenityIds: Id[];
  images: {
    imageId: Id;
    caption: string;
    ordering: number;
  }[];
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
