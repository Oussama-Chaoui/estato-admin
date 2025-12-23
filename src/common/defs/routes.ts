import Auth from '@modules/auth/defs/routes';
import Users from '@modules/users/defs/routes';
import Permissions from '@modules/permissions/defs/routes';
import Properties from '@modules/properties/defs/routes';
import Agents from '@modules/agents/defs/routes';
import AgentApplications from '@modules/agent-applications/defs/routes';
import Locations from '@modules/locations/defs/routes';
import Amenities from '@modules/amenities/defs/routes';
import Posts from '@modules/posts/defs/routes';
import Categories from '@modules/categories/defs/routes';
import Tags from '@modules/tags/defs/routes';
import Notifications from '@modules/notifications/defs/routes';

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
  Agents,
  AgentApplications,
  Locations,
  Amenities,
  Posts,
  Categories,
  Tags,
  Notifications,
};

export default Routes;
