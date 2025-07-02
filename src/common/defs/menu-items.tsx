import Routes from '@common/defs/routes';
import { CRUD_ACTION, NavGroup } from '@common/defs/types';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import Namespaces from '@common/defs/namespaces';
import { Article, Category, Group, House, Label } from '@mui/icons-material';

export const menuItems: NavGroup[] = [
  {
    items: [
      {
        text: 'Dashboard',
        icon: <DashboardCustomizeRoundedIcon />,
        link: Routes.Common.Home,
      },
      {
        text: 'Users',
        icon: <Group />,
        link: Routes.Users.ReadAll,
        namespace: Namespaces.Users,
        permission: CRUD_ACTION.READ,
        routes: Routes.Users,
      },
      {
        text: 'Properties',
        icon: <House />,
        link: Routes.Properties.ReadAll,
        namespace: Namespaces.Properties,
        permission: CRUD_ACTION.READ,
        routes: Routes.Properties,
      },
      {
        text: 'Posts',
        icon: <Article />,
        link: Routes.Posts.ReadAll,
        namespace: Namespaces.Posts,
        permission: CRUD_ACTION.READ,
        routes: Routes.Posts,
      },
      {
        text: 'Categories',
        icon: <Category />,
        link: Routes.Categories.ReadAll,
        namespace: Namespaces.Categories,
        permission: CRUD_ACTION.READ,
        routes: Routes.Categories,
      },
      {
        text: 'Tags',
        icon: <Label />,
        link: Routes.Tags.ReadAll,
        namespace: Namespaces.Tags,
        permission: CRUD_ACTION.READ,
        routes: Routes.Tags,
      },
    ],
  },
];
