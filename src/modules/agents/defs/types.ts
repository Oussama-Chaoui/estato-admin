import { CrudObject, Id } from '@common/defs/types';
// eslint-disable-next-line import/no-cycle
import { Language, User } from '@modules/users/defs/types';

export interface Agent extends CrudObject {
  licenceNumber: string;
  experience: string;
  bio: string;
  agencyName: string;
  agencyAddress: string;
  userId: Id;
  user: User;
  languages: Language[];
}
