import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import Routes from '@common/defs/routes';
import UpsertUserStepper from '@modules/users/components/partials/UpsertUserStepper';
import { ROLE } from '@modules/permissions/defs/types';

const QuickActions: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation(['dashboard', 'common']);
  const [modalOpen, setModalOpen] = useState(false);
  const [preSelectedRole, setPreSelectedRole] = useState<ROLE | null>(null);

  const actions = [
    {
      title: t('dashboard:add_property'),
      description: t('dashboard:add_property_description'),
      icon: <AddIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + '20',
      onClick: () => router.push(Routes.Properties.CreateOne),
      comingSoon: false,
    },
    {
      title: t('dashboard:add_agent'),
      description: t('dashboard:add_agent_description'),
      icon: <BusinessIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light + '20',
      onClick: () => {
        setPreSelectedRole(ROLE.AGENT);
        setModalOpen(true);
      },
      comingSoon: false,
    },
    {
      title: t('dashboard:add_client'),
      description: t('dashboard:add_client_description'),
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + '20',
      onClick: () => {
        setPreSelectedRole(ROLE.CLIENT);
        setModalOpen(true);
      },
      comingSoon: false,
    },
    {
      title: t('dashboard:view_properties'),
      description: t('dashboard:view_properties_description'),
      icon: <HomeIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + '20',
      onClick: () => router.push(Routes.Properties.ReadAll),
      comingSoon: false,
    },
    {
      title: t('dashboard:manage_inquiries'),
      description: t('dashboard:manage_inquiries_description'),
      icon: <EmailIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light + '20',
      onClick: () => {},
      comingSoon: true,
    },
    {
      title: t('dashboard:schedule_appointments'),
      description: t('dashboard:schedule_appointments_description'),
      icon: <EventIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.error.main,
      bgColor: theme.palette.error.light + '20',
      onClick: () => {},
      comingSoon: true,
    },
    {
      title: t('dashboard:reports_analytics'),
      description: t('dashboard:reports_analytics_description'),
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light + '20',
      onClick: () => {},
      comingSoon: true,
    },
    {
      title: t('dashboard:system_settings'),
      description: t('dashboard:system_settings_description'),
      icon: <SettingsIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.grey[600],
      bgColor: theme.palette.grey[100],
      onClick: () => {},
      comingSoon: true,
    },
  ];

  const handleCloseModal = () => {
    setModalOpen(false);
    setPreSelectedRole(null);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('dashboard:quick_actions')}
          </Typography>
          <Grid container spacing={2}>
            {actions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={action.onClick}
                  disabled={action.comingSoon}
                  sx={{
                    height: 120,
                    flexDirection: 'column',
                    border: `2px solid ${action.color}30`,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${action.bgColor} 0%, ${action.bgColor}00 100%)`,
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    opacity: action.comingSoon ? 0.7 : 1,
                    '&:hover': {
                      transform: action.comingSoon ? 'none' : 'translateY(-2px)',
                      borderColor: action.comingSoon ? action.color + '30' : action.color,
                      backgroundColor: action.comingSoon ? action.bgColor : action.bgColor,
                      boxShadow: action.comingSoon ? 'none' : `0 4px 12px ${action.color}20`,
                    },
                    '&:disabled': {
                      opacity: 0.7,
                    },
                  }}
                >
                  {action.comingSoon && (
                    <Chip
                      label={t('dashboard:coming_soon')}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: theme.palette.warning.main + '20',
                        color: theme.palette.warning.main,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        zIndex: 1,
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      color: action.color,
                      mb: 1,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="text.primary" mb={0.5}>
                    {action.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ lineHeight: 1.2 }}
                  >
                    {action.description}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* User Creation Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 1000,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {preSelectedRole === ROLE.AGENT
              ? t('dashboard:add_new_agent')
              : t('dashboard:add_new_client')}
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, m: 4 }}>
          <UpsertUserStepper preSelectedRole={preSelectedRole as ROLE} onClose={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActions;
