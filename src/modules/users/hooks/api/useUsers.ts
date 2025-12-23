import ApiRoutes from '@common/defs/api-routes';
import { ROLE } from '@modules/permissions/defs/types';
import { User } from '@modules/users/defs/types';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';

export interface CreateOneInput {
  id?: string | number;
  name: string;
  email: string | null;
  phone: string | null;
  password: string;
  role: ROLE;
  roles?: ROLE[];
  photoId?: string;

  licenceNumber?: string;
  experience?: number;
  bio?: string;
  agencyName?: string;
  agencyAddress?: string;

  nicNumber?: string;
  passport?: string;
}

export interface UpdateOneInput {
  id?: string | number;
  name: string;
  email: string | null;
  phone: string | null;
  password?: string;
  role: ROLE;
  roles?: ROLE[];
  photoId?: string;

  licenceNumber?: string;
  experience?: number;
  bio?: string;
  agencyName?: string;
  agencyAddress?: string;

  nicNumber?: string;
  passport?: string;
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

const useUsers: UseItems<User, CreateOneInput, UpdateOneInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.Users;
  const useItemsHook = useItems<User, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  return useItemsHook;
};

export default useUsers;
