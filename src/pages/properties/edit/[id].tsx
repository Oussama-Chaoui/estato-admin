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
import UpsertPropertyStepper from '@modules/properties/components/partials/UpsertPropertyStepper';

const PropertiesPage: NextPage = () => {
  const router = useRouter();
  const rawId = router.asPath.split('/').pop()?.split('?')[0] ?? '';
  const id: Id = Number(rawId);
  const { t } = useTranslation(['property', 'common']);

  return (
    <>
      <PageHeader title={t(`property:${Labels.Properties.EditOne}`)} />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t(`property:${Labels.Properties.Items}`), href: Routes.Properties.ReadAll },
          { name: t(`property:${Labels.Properties.EditOne}`) },
        ]}
      />

      {id && <UpsertPropertyStepper itemId={id} />}
    </>
  );
};

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'topbar',
      'footer',
      'leftbar',
      'property',
      'common',
      'amenities',
    ])),
  },
});

export default withAuth(
  withPermissions(PropertiesPage, {
    requiredPermissions: {
      entity: Namespaces.Properties,
      action: CRUD_ACTION.UPDATE,
    },
    redirectUrl: Routes.Permissions.Forbidden,
  }),
  {
    mode: AUTH_MODE.LOGGED_IN,
    redirectUrl: Routes.Auth.Login,
  }
);
