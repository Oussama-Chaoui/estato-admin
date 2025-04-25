import { CrudObject, Id } from '@common/defs/types';
import { Upload } from '@modules/uploads/defs/types';
import { Language, User } from '@modules/users/defs/types';

export interface Agent extends CrudObject {
  licenseNumber: string;
  experience: string;
  bio: string;
  photoId: Id;
  agencyName: string;
  agency_address: string;
  userId: Id;
  user: User;
  languages: Language[];
  photo: Upload;
}
