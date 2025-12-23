import { CrudAppRoutes } from '@common/defs/types';

const prefix = '/users';
const Routes: CrudAppRoutes = {
  ReadAll: prefix,
  Me: prefix + '/me',
  ReadOne: prefix + '/{id}',
  CreateOne: prefix + '/create',
  UpdateOne: prefix + '/edit/{id}',
};

export default Routes;
