import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Leftbar, { LEFTBAR_WIDTH } from './Leftbar';
import Topbar from './Topbar';
import Box from '@mui/material/Box';
import { Container, useTheme, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import useAuth from '@modules/auth/hooks/api/useAuth';

interface ILayoutProps {
  children: React.ReactNode;
}

const Layout = (props: ILayoutProps) => {
  const { children } = props;
  const theme = useTheme();
  const [openLeftbar, setOpenLeftbar] = useState(true);
  const [display, setDisplay] = useState(true);
  const underMaintenance = process.env.NEXT_PUBLIC_UNDER_MAINTENANCE === 'true';
  const { t } = useTranslation('common');
  const { user } = useAuth();

  useEffect(() => {
    setDisplay(!underMaintenance);
  }, [underMaintenance]);

  if (!display) {
    return (
      <Box
        id="webview-container"
        sx={{
          height: '100%',
          backgroundColor: 'common.white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ padding: 1 }}>
          <Typography textAlign="center" marginBottom={2}>
            {t('maintenance_message')}
          </Typography>
          <Typography textAlign="center" marginBottom={2}>
            {t('maintenance_thanks')}
          </Typography>
          <Button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 55,
              fontWeight: 500,
              borderRadius: '4px',
              fontFamily: 'Raleway',
              backgroundColor: '#ff7b00',
              color: 'white',
              fontSize: 16,
              gap: '8px',
              marginTop: '24px',
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingLeft: '20px',
              paddingRight: '20px',
            }}
            onClick={() => {
              window.history.back();
            }}
          >
            <ArrowBackIcon />
            {t('return')}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <div>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_TITLE}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        {/* CKEditor 5 Classic build theme from CDN */}
        <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/44.3.0/ckeditor5.css" />
      </Head>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        {user && <Leftbar open={openLeftbar} onToggle={(open) => setOpenLeftbar(open)} />}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: openLeftbar && user ? LEFTBAR_WIDTH + 'px' : 0,
            width: openLeftbar && user ? `calc(100% - ${LEFTBAR_WIDTH}px)` : '100%',
            transition: theme.transitions.create(['all'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Topbar />
          <Box
            component="main"
            sx={{
              flex: 1,
              pt: { xs: '88px', lg: '96px' },
              pb: 4,
              px: { xs: 2, sm: 3, md: 4 },
              minHeight: 'calc(100vh - 60px)',
            }}
          >
            <Container
              maxWidth="xl"
              sx={{
                height: '100%',
                transition: theme.transitions.create(['all'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              }}
            >
              {children}
            </Container>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Layout;
