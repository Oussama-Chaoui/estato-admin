import { CrudAppRoutes } from '@common/defs/types';

const prefix = '/properties';
const Routes: CrudAppRoutes = {
  ReadAll: prefix,
  readOne: prefix + '/{id}',
  CreateOne: prefix + '/create',
  UpdateOne: prefix + 'edit/{id}',
};

export default Routes;
