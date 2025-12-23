import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import { NextPage } from 'next';
import Routes from '@common/defs/routes';
import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import PageHeader from '@common/components/lib/partials/PageHeader';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import ReadAllNotifications from '@modules/notifications/components/pages/ReadAll';

const NotificationsPage: NextPage = () => {
  const { t } = useTranslation(['notifications', 'common']);

  return (
    <>
      <PageHeader title={t('notifications:page_title')} />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t('notifications:page_title') },
        ]}
      />
      <ReadAllNotifications />
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'notifications',
      'footer',
      'leftbar',
      'common',
      'topbar',
    ])),
  },
});

export default withAuth(NotificationsPage, {
  mode: AUTH_MODE.LOGGED_IN,
  redirectUrl: Routes.Auth.Login,
});
