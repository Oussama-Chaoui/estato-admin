import { CrudAppRoutes } from '@common/defs/types';

const prefix = '/agent-applications';
const Routes: CrudAppRoutes = {
  ReadAll: prefix,
  CreateOne: prefix + '/create',
  UpdateOne: prefix + '/edit/{id}',
};

export default Routes;
