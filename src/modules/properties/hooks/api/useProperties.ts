import ApiRoutes from '@common/defs/api-routes';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Id } from '@common/defs/types';
import { Property, FURNISHING_STATUS } from '@modules/properties/defs/types';

export interface CreateOneInput {
  title: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  description: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  monthlyPrice: number;
  salePrice: number;
  dailyPrice: number;
  dailyPriceEnabled: boolean;
  currency: string;
  monthlyPriceEnabled: boolean;
  type: string;
  locationId?: Id;
  yearBuilt: number;
  hasVR: boolean;
  featured?: boolean;
  furnishingStatus: FURNISHING_STATUS;
  agentIds: Id[];
  amenityIds: Id[];
  images: {
    imageId: Id;
    caption: string;
    ordering: number;
    /** client-only preview URL – server will ignore */
    preview?: string;
  }[];
  // Nested features object (matching backend structure)
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    garages: number;
    floors: number;
  };
  location?: {
    cityId: Id;
    streetAddress: {
      en?: string;
      fr: string;
      es?: string;
      ar: string;
    };
    latitude: number;
    longitude: number;
  };
}

export interface UpdateOneInput {
  title: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  description: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  monthlyPrice: number;
  salePrice: number;
  dailyPrice: number;
  dailyPriceEnabled: boolean;
  currency: string;
  monthlyPriceEnabled: boolean;
  type: string;
  locationId: Id;
  yearBuilt: number;
  hasVR: boolean;
  featured?: boolean;
  furnishingStatus: FURNISHING_STATUS;
  agentIds: Id[];
  amenityIds: Id[];
  images: {
    imageId: Id;
    caption: string;
    ordering: number;
  }[];
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    garages: number;
    floors: number;
  };
  location: {
    id: Id;
    cityId: Id;
    streetAddress: {
      en?: string;
      fr: string;
      es?: string;
      ar: string;
    };
    latitude: number;
    longitude: number;
  };
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
