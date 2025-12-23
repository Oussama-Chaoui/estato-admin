import React from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import withPermissions from '@modules/permissions/hocs/withPermissions';
import ApplicationsTable from '@modules/agent-applications/components/pages/ApplicationsTable';
import PageHeader from '@common/components/lib/partials/PageHeader';
import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import Routes from '@common/defs/routes';
import Labels from '@common/defs/labels';
import Namespaces from '@common/defs/namespaces';
import { CRUD_ACTION } from '@common/defs/types';

const AgentApplicationsPage: NextPage = () => {
  const { t } = useTranslation(['common', 'agent-applications']);

  return (
    <>
      <PageHeader title={t(`agent-applications:${Labels.AgentApplications.ReadAll}`)} />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t(`agent-applications:${Labels.AgentApplications.Items}`) },
        ]}
      />
      <ApplicationsTable />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'topbar',
      'footer',
      'leftbar',
      'common',
      'agent-applications',
    ])),
  },
});

export default withAuth(
  withPermissions(AgentApplicationsPage, {
    requiredPermissions: {
      entity: Namespaces.AgentApplications,
      action: CRUD_ACTION.READ,
    },
    redirectUrl: Routes.Permissions.Forbidden,
  }),
  {
    mode: AUTH_MODE.LOGGED_IN,
  }
);
