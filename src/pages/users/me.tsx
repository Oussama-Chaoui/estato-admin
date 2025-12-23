import { NextPage } from 'next';
import withAuth, { AUTH_MODE } from '@modules/auth/hocs/withAuth';
import Routes from '@common/defs/routes';
import { Box } from '@mui/material';
import PageHeader from '@common/components/lib/partials/PageHeader';
import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MyProfile from '@modules/users/components/partials/MyProfile';

const MyProfilePage: NextPage = () => {
  const { t } = useTranslation(['common', 'user']);

  return (
    <>
      <PageHeader title={t('user:profile.title')} />
      <CustomBreadcrumbs
        links={[
          { name: t('common:dashboard'), href: Routes.Common.Home },
          { name: t('user:profile.title') },
        ]}
      />
      <Box sx={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
        <MyProfile />
      </Box>
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['topbar', 'footer', 'leftbar', 'common', 'user'])),
  },
});

export default withAuth(MyProfilePage, {
  mode: AUTH_MODE.LOGGED_IN,
  redirectUrl: Routes.Auth.Login,
});
