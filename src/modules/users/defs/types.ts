import { CrudObject, Id } from '@common/defs/types';
// eslint-disable-next-line import/no-cycle
import { Agent } from '@modules/agents/defs/types';
import { ROLE } from '@modules/permissions/defs/types';
import { Upload } from '@modules/uploads/defs/types';

export interface User extends CrudObject {
  name: string;
  phone: string;
  email: string;
  rolesNames: ROLE[];
  permissionsNames: string[];
  agent: Agent | null;
}

export interface Client extends CrudObject {
  nicNumber: string;
  passport: string | null;
  userId: Id;
  user: User;
  imageId?: Id;
  image: Upload;
}

export type Language = {
  id: Id;
  name: string;
};
