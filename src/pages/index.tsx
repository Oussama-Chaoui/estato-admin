import Dashboard from '@modules/dashboard/components/Dashboard';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Routes from '@common/defs/routes';

const Index: NextPage = () => {
  return <Dashboard />;
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'topbar',
      'footer',
      'leftbar',
      'home',
      'dashboard',
      'common',
    ])),
  },
});
export default withAuth(Index, {
  mode: AUTH_MODE.LOGGED_IN,
  redirectUrl: Routes.Auth.Login,
});
