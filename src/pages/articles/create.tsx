import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import withPermissions from '@modules/permissions/hocs/withPermissions';
import { NextPage } from 'next';
import Routes from '@common/defs/routes';
import PageHeader from '@common/components/lib/partials/PageHeader';
import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import { CRUD_ACTION } from '@common/defs/types';
import Namespaces from '@common/defs/namespaces';
import Labels from '@common/defs/labels';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import UpsertPostFormWithPreview from '@modules/posts/components/partials/UpsertPostFormWithPreview';

const PostsPage: NextPage = () => {
  const { t } = useTranslation(['post', 'common']);

  return (
    <>
      <PageHeader title={t(`post:${Labels.Posts.CreateNewOne}`)} />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t(`post:${Labels.Posts.Items}`), href: Routes.Posts.ReadAll },
          { name: t(`post:${Labels.Posts.NewOne}`) },
        ]}
      />
      <UpsertPostFormWithPreview />
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
      action: CRUD_ACTION.CREATE,
    },
    redirectUrl: Routes.Permissions.Forbidden,
  }),
  {
    mode: AUTH_MODE.LOGGED_IN,
    redirectUrl: Routes.Auth.Login,
  }
);
