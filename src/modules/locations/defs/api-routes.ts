import { CrudApiRoutes } from '@common/defs/types';

const prefix = '/locations';
const ApiRoutes: CrudApiRoutes = {
  CreateOne: prefix,
  ReadAll: prefix,
  ReadOne: prefix + '/{id}',
  UpdateOne: prefix + '/{id}',
  DeleteOne: prefix + '/{id}',
  ReadAllCitiesWithRegions: prefix + '/cities',
};

export default ApiRoutes;
