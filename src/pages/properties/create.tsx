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
import UpsertPropertyStepper from '@modules/properties/components/partials/UpsertPropertyStepper';

const PropertiesPage: NextPage = () => {
  const { t } = useTranslation(['property', 'common']);

  return (
    <>
      <PageHeader title={t(`property:${Labels.Properties.CreateNewOne}`)} />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t(`property:${Labels.Properties.Items}`), href: Routes.Properties.ReadAll },
          { name: t(`property:${Labels.Properties.NewOne}`) },
        ]}
      />
      <UpsertPropertyStepper />
      {/* <CreateUserForm /> */}
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'topbar',
      'footer',
      'leftbar',
      'property',
      'common',
    ])),
  },
});

export default withAuth(
  withPermissions(PropertiesPage, {
    requiredPermissions: {
      entity: Namespaces.Properties,
      action: CRUD_ACTION.CREATE,
    },
    redirectUrl: Routes.Permissions.Forbidden,
  }),
  {
    mode: AUTH_MODE.LOGGED_IN,
    redirectUrl: Routes.Auth.Login,
  }
);
