import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Alert,
  CircularProgress,
  Fade,
  Chip,
} from '@mui/material';
import {
  BeachAccess as BeachIcon,
  Home as HomeIcon,
  Sell as SellIcon,
  Apps as AppsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useWebsiteFocus from '../hooks/useWebsiteFocus';
import { WEBSITE_FOCUS } from '../defs/types';

const WebsiteFocusControl: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation(['dashboard', 'common']);
  const { websiteFocus, isLoading, error, updateWebsiteFocus } = useWebsiteFocus();

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newFocus: WEBSITE_FOCUS | null) => {
    if (newFocus !== null && newFocus !== websiteFocus) {
      updateWebsiteFocus(newFocus);
    }
  };

  const focusOptions = [
    {
      value: WEBSITE_FOCUS.DAILY_RENT,
      label: t('dashboard:website_focus.daily_rent.label'),
      icon: <BeachIcon />,
      description: t('dashboard:website_focus.daily_rent.description'),
      color: theme.palette.info.main,
    },
    {
      value: WEBSITE_FOCUS.RENT,
      label: t('dashboard:website_focus.monthly_rent.label'),
      icon: <HomeIcon />,
      description: t('dashboard:website_focus.monthly_rent.description'),
      color: theme.palette.success.main,
    },
    {
      value: WEBSITE_FOCUS.SELLING,
      label: t('dashboard:website_focus.selling.label'),
      icon: <SellIcon />,
      description: t('dashboard:website_focus.selling.description'),
      color: theme.palette.warning.main,
    },
    {
      value: WEBSITE_FOCUS.ALL,
      label: t('dashboard:website_focus.all.label'),
      icon: <AppsIcon />,
      description: t('dashboard:website_focus.all.description'),
      color: theme.palette.primary.main,
    },
  ];

  const currentOption = focusOptions.find((opt) => opt.value === websiteFocus);

  return (
    <Fade in timeout={800}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.light}30 100%)`,
              }}
            >
              <SettingsIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
            </Box>
            <Box flex={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '1.125rem',
                }}
              >
                {t('dashboard:website_focus.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                }}
              >
                {t('dashboard:website_focus.subtitle')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {isLoading && (
                <CircularProgress
                  size={20}
                  thickness={4}
                  sx={{ color: theme.palette.primary.main }}
                />
              )}
              {currentOption && (
                <Chip
                  label={currentOption.label}
                  icon={currentOption.icon}
                  sx={{
                    fontWeight: 600,
                    bgcolor: `${currentOption.color}15`,
                    color: currentOption.color,
                    borderColor: currentOption.color,
                    '& .MuiChip-icon': {
                      color: currentOption.color,
                    },
                  }}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Toggle Buttons - Always visible */}
          <ToggleButtonGroup
            value={websiteFocus}
            exclusive
            onChange={handleChange}
            aria-label="website focus"
            fullWidth
            disabled={isLoading}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 1.5,
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.3s ease',
              '& .MuiToggleButtonGroup-grouped': {
                border: 0,
                borderRadius: '12px !important',
                '&:not(:first-of-type)': {
                  marginLeft: 0,
                },
              },
            }}
          >
            {focusOptions.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{
                  py: 2,
                  px: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  textTransform: 'none',
                  border: `2px solid ${theme.palette.divider} !important`,
                  background: theme.palette.background.paper,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: `${option.color}08`,
                    borderColor: `${option.color}40 !important`,
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    background: `${option.color}15 !important`,
                    borderColor: `${option.color} !important`,
                    color: option.color,
                    fontWeight: 700,
                    '&:hover': {
                      background: `${option.color}20 !important`,
                    },
                    '& .MuiSvgIcon-root': {
                      color: option.color,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    fontSize: 32,
                    color:
                      websiteFocus === option.value ? option.color : theme.palette.text.secondary,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {option.icon}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={websiteFocus === option.value ? 700 : 600}
                  sx={{
                    color:
                      websiteFocus === option.value ? option.color : theme.palette.text.primary,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {option.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    fontSize: '0.7rem',
                  }}
                >
                  {option.description}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default WebsiteFocusControl;
