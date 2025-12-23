import Routes from '@common/defs/routes';
import { CRUD_ACTION, NavGroup } from '@common/defs/types';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import Namespaces from '@common/defs/namespaces';
import { Article, Group, House, Assignment } from '@mui/icons-material';

export const getMenuItems = (t: (key: string) => string): NavGroup[] => [
  {
    items: [
      {
        text: t('leftbar:menu.dashboard'),
        icon: <DashboardCustomizeRoundedIcon />,
        link: Routes.Common.Home,
      },
      {
        text: t('leftbar:menu.users'),
        icon: <Group />,
        link: Routes.Users.ReadAll,
        namespace: Namespaces.Users,
        permission: CRUD_ACTION.READ,
        routes: Routes.Users,
      },
      {
        text: t('leftbar:menu.properties'),
        icon: <House />,
        link: Routes.Properties.ReadAll,
        namespace: Namespaces.Properties,
        permission: CRUD_ACTION.READ,
        routes: Routes.Properties,
      },
      {
        text: t('leftbar:menu.posts'),
        icon: <Article />,
        link: Routes.Posts.ReadAll,
        namespace: Namespaces.Posts,
        permission: CRUD_ACTION.READ,
        routes: Routes.Posts,
      },
      {
        text: t('leftbar:menu.agent_applications'),
        icon: <Assignment />,
        link: Routes.AgentApplications.ReadAll,
        namespace: Namespaces.AgentApplications,
        permission: CRUD_ACTION.READ,
        routes: Routes.AgentApplications,
      },
    ],
  },
];
