import ApiRoutes from '@common/defs/api-routes';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Id } from '@common/defs/types';
import { Client } from '@modules/users/defs/types';
import { Agent } from '@modules/agents/defs/types';
import { RENTAL_TYPE } from '@modules/properties/defs/types';

export interface Rental {
  id: Id;
  propertyId: Id;
  clientId: Id | null;
  agentId: Id;
  startDate: string;
  endDate: string;
  price: number;
  type: RENTAL_TYPE;
  createdAt: string;
  updatedAt: string;
  renter?: Client;
  agent?: Agent;
}

export interface CreateRentalInput {
  propertyId: Id;
  clientId?: Id | null;
  agentId: Id;
  startDate: string;
  endDate: string;
  price: number;
  type: RENTAL_TYPE;
  name?: string;
  email?: string;
  phone?: string;
  nicNumber?: string;
  passport?: string;
}

export interface UpdateRentalInput extends CreateRentalInput {}

const useRentals: UseItems<Rental, CreateRentalInput, UpdateRentalInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.Rentals;
  const useItemsHook = useItems<Rental, CreateRentalInput, UpdateRentalInput>(apiRoutes, opts);
  return useItemsHook;
};

export default useRentals;
