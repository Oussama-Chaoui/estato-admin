import { CrudObject, Id } from '@common/defs/types';
// eslint-disable-next-line import/no-cycle
import { Agent } from '@modules/agents/defs/types';
import { ROLE } from '@modules/permissions/defs/types';
import { Upload } from '@modules/uploads/defs/types';

export interface User extends CrudObject {
  name: string;
  phone: string | null;
  email: string | null;
  photoId: Id | null;
  photo: Upload | null;
  rolesNames: ROLE[];
  permissionsNames: string[];
  agent: Agent | null;
  client: Client | null;
}

export interface Client extends CrudObject {
  nicNumber: string | null;
  passport: string | null;
  userId: Id;
  user: User;
}

export type Language = {
  id: Id;
  name: string;
};
