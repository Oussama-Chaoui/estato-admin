import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import withPermissions from '@modules/permissions/hocs/withPermissions';
import { NextPage } from 'next';
import Routes from '@common/defs/routes';
import { useRouter } from 'next/router';
import PageHeader from '@common/components/lib/partials/PageHeader';
import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import { CRUD_ACTION, Id } from '@common/defs/types';
import Namespaces from '@common/defs/namespaces';
import Labels from '@common/defs/labels';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import UpsertUserStepper from '@modules/users/components/partials/UpsertUserStepper';

const UsersPage: NextPage = () => {
  const router = useRouter();
  const rawId = router.asPath.split('/').pop()?.split('?')[0] ?? '';
  const id: Id = Number(rawId);
  const { t } = useTranslation(['user', 'common']);

  return (
    <>
      <PageHeader title={t(`user:${Labels.Users.EditOne}`)} />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t(`user:${Labels.Users.Items}`), href: Routes.Users.ReadAll },
          { name: t(`user:${Labels.Users.EditOne}`) },
        ]}
      />

      {id && <UpsertUserStepper itemId={id} />}
    </>
  );
};

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'user', 'common'])),
  },
});

export default withAuth(
  withPermissions(UsersPage, {
    requiredPermissions: {
      entity: Namespaces.Users,
      action: CRUD_ACTION.UPDATE,
    },
    redirectUrl: Routes.Permissions.Forbidden,
  }),
  {
    mode: AUTH_MODE.LOGGED_IN,
    redirectUrl: Routes.Auth.Login,
  }
);
