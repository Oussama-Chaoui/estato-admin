import ApiRoutes from '@common/defs/api-routes';
import useItems, {
  UseItemsHook,
  UseItemsOptions,
  defaultOptions,
  ItemsResponse,
} from '@common/hooks/useItems';
import { Location, City } from '@modules/locations/defs/types';
import { Any, Id } from '@common/defs/types';
import useApi from '@common/hooks/useApi';

export interface CreateOneInput {
  cityId: Id;
  streetAddress: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  latitude: number;
  longitude: number;
}

export interface UpdateOneInput {
  cityId: Id;
  streetAddress: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  latitude: number;
  longitude: number;
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

export interface UseLocationsHook extends UseItemsHook<Location, CreateOneInput, UpdateOneInput> {
  readAllCitiesWithRegions: () => Promise<ItemsResponse<City>>;
}

export type UseLocations = (opts?: UseItemsOptions) => UseLocationsHook;

const useLocations: UseLocations = (opts: UseItemsOptions = defaultOptions) => {
  const apiRoutes = ApiRoutes.Locations;
  const useItemsHook = useItems<Location, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  const fetchApi = useApi();

  const readAllCitiesWithRegions = async () => {
    const endpoint = apiRoutes.ReadAllCitiesWithRegions;
    const data: Record<string, Any> = {
      page: 1,
      perPage: 'all',
    };

    const response = await fetchApi<{ items: City[]; meta: Any }>(endpoint, {
      method: 'GET',
      data,
    });

    return response;
  };

  const hook: UseLocationsHook = {
    ...useItemsHook,
    readAllCitiesWithRegions,
  };

  return hook;
};

export default useLocations;
