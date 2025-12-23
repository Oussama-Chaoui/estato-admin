const prefix = '/settings';

const ApiRoutes = {
  CreateOne: prefix,
  ReadAll: prefix,
  ReadOne: prefix + '/{id}',
  UpdateOne: prefix + '/{id}',
  DeleteOne: prefix + '/{id}',
  GetWebsiteFocus: prefix + '/website-focus',
  UpdateWebsiteFocus: prefix + '/website-focus',
};

export default ApiRoutes;
