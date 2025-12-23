import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Button,
  useTheme,
  Paper,
  Tabs,
  Tab,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useDashboard from '@modules/dashboard/hooks/useDashboard';
import StatisticsCards from './StatisticsCards';
import DashboardCharts from './DashboardCharts';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import DashboardSkeleton from './DashboardSkeleton';
import WebsiteFocusControl from '@modules/settings/components/WebsiteFocusControl';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['dashboard', 'common']);
  const { data, isLoading, error, refetch } = useDashboard();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Fade in timeout={500}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={refetch}
                sx={{ fontWeight: 600 }}
              >
                {t('dashboard:retry')}
              </Button>
            }
            sx={{
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('dashboard:failed_to_load_dashboard_data')}
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Fade>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Fade in timeout={500}>
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            {t('dashboard:no_dashboard_data_available')}
          </Alert>
        </Fade>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}05 100%)`,
        pb: 6,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Enhanced Header */}
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.light}05 100%)`,
              border: `1px solid ${theme.palette.primary.light}20`,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography
                  variant="h3"
                  component="h1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  }}
                >
                  {t('dashboard:dashboard_overview')}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    maxWidth: 600,
                  }}
                >
                  {t('dashboard:welcome_back_description')}
                </Typography>
              </Box>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={refetch}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {t('dashboard:refresh_data')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Tab Navigation */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: '10px 10px 0 0',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<DashboardIcon />} label={t('dashboard:overview')} iconPosition="start" />
              <Tab icon={<AnalyticsIcon />} label={t('dashboard:analytics')} iconPosition="start" />
              <Tab icon={<TimelineIcon />} label={t('dashboard:activity')} iconPosition="start" />
            </Tabs>
          </Paper>
        </Fade>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <Slide direction="up" in={tabValue === 0} timeout={500}>
            <Box>
              {/* Quick Actions */}
              <Fade in timeout={800}>
                <Box mb={4}>
                  <QuickActions />
                </Box>
              </Fade>

              {/* Website Focus Control */}
              <Fade in timeout={900}>
                <Box mb={4}>
                  <WebsiteFocusControl />
                </Box>
              </Fade>

              {/* Statistics Cards */}
              <Zoom in timeout={1000}>
                <Box mb={4}>
                  <StatisticsCards statistics={data.statistics} />
                </Box>
              </Zoom>
            </Box>
          </Slide>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Slide direction="up" in={tabValue === 1} timeout={500}>
            <Box>
              <Fade in timeout={800}>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    {t('dashboard:analytics_insights')}
                  </Typography>
                  <DashboardCharts data={data} />
                </Box>
              </Fade>
            </Box>
          </Slide>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Slide direction="up" in={tabValue === 2} timeout={500}>
            <Box>
              <Fade in timeout={800}>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    {t('dashboard:recent_activity')}
                  </Typography>
                  <RecentActivity data={data} />
                </Box>
              </Fade>
            </Box>
          </Slide>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Dashboard;
