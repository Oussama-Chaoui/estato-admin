import { CrudObject, Id } from '@common/defs/types';
import { ROLE } from '@modules/permissions/defs/types';

export interface User extends CrudObject {
  email: string;
  rolesNames: ROLE[];
  permissionsNames: string[];
}

export interface Agent extends CrudObject {
  licenseNumber: string;
  experience: string;
  bio: string;
  photo_id: string;
  agency_name: string;
  agency_address: string;
  photo: string;
  user: User;
  languages: Language[];
}

export type Language = {
  id: Id;
  name: string;
};
