import Auth from '@modules/auth/defs/routes';
import Users from '@modules/users/defs/routes';
import Permissions from '@modules/permissions/defs/routes';
import Properties from '@modules/properties/defs/routes';

const Common = {
  Home: '/',
  NotFound: '/404',
};

const Routes = {
  Common,
  Auth,
  Permissions,
  Users,
  Properties,
};

export default Routes;
