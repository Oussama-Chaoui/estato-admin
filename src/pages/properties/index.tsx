import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import withPermissions from '@modules/permissions/hocs/withPermissions';
import { NextPage } from 'next';
import Routes from '@common/defs/routes';
import UsersTable from '@modules/users/components/partials/UsersTable';
import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import { useRouter } from 'next/router';
import { Add } from '@mui/icons-material';
import PageHeader from '@common/components/lib/partials/PageHeader';
import { CRUD_ACTION } from '@common/defs/types';
import Namespaces from '@common/defs/namespaces';
import Labels from '@common/defs/labels';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import PropertiesTable from '@modules/properties/components/partials/PropertiesTable';

const PropertiesPage: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation(['property']);
  return (
    <>
      <PageHeader
        title={t(`property:${Labels.Properties.ReadAll}`)}
        action={{
          label: t(`property:${Labels.Properties.NewOne}`),
          startIcon: <Add />,
          onClick: () => router.push(Routes.Properties.CreateOne),
          permission: {
            entity: Namespaces.Properties,
            action: CRUD_ACTION.CREATE,
          },
        }}
      />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t(`property:${Labels.Properties.Items}`) },
        ]}
      />
      <PropertiesTable />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'property', 'common'])),
  },
});

export default withAuth(
  withPermissions(PropertiesPage, {
    requiredPermissions: {
      entity: Namespaces.Properties,
      action: CRUD_ACTION.READ,
    },
    redirectUrl: Routes.Permissions.Forbidden,
  }),
  {
    mode: AUTH_MODE.LOGGED_IN,
    redirectUrl: Routes.Auth.Login,
  }
);
