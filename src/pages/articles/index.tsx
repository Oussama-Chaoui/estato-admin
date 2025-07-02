import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import withPermissions from '@modules/permissions/hocs/withPermissions';
import { NextPage } from 'next';
import Routes from '@common/defs/routes';
import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import { useRouter } from 'next/router';
import { Add } from '@mui/icons-material';
import PageHeader from '@common/components/lib/partials/PageHeader';
import { CRUD_ACTION } from '@common/defs/types';
import Namespaces from '@common/defs/namespaces';
import Labels from '@common/defs/labels';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import PostsTable from '@modules/posts/components/partials/PostsTable';

const PostsPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation(['post']);
  return (
    <>
      <PageHeader
        title={t(`post:${Labels.Posts.ReadAll}`)}
        action={{
          label: t(`post:${Labels.Posts.NewOne}`),
          startIcon: <Add />,
          onClick: () => router.push(Routes.Posts.CreateOne),
          permission: {
            entity: Namespaces.Posts,
            action: CRUD_ACTION.CREATE,
          },
        }}
      />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t(`post:${Labels.Posts.Items}`) },
        ]}
      />
      <PostsTable />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'post', 'common'])),
  },
});

export default withAuth(
  withPermissions(PostsPage, {
    requiredPermissions: {
      entity: Namespaces.Posts,
      action: CRUD_ACTION.READ,
    },
    redirectUrl: Routes.Permissions.Forbidden,
  }),
  {
    mode: AUTH_MODE.LOGGED_IN,
    redirectUrl: Routes.Auth.Login,
  }
);
