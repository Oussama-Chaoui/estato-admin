import React from 'react';
import { Typography, Box, Grid, useTheme } from '@mui/material';
import { useTranslatedText } from '../../../common/utils/translations';
import {
  Email as EmailIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import { useTranslation } from 'react-i18next';

import {
  AGENT_APPLICATION_STATUS,
  DashboardData,
  INQUIRY_STATUS,
} from '@modules/dashboard/defs/types';

dayjs.extend(relativeTime);

interface RecentActivityProps {
  data: DashboardData;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ data }) => {
  const theme = useTheme();
  const getTranslatedText = useTranslatedText();
  const { t, i18n } = useTranslation(['dashboard', 'common']);

  // Configure dayjs locale based on current language
  const currentLocale = i18n.language || 'fr';
  dayjs.locale(currentLocale);

  // Helper function for localized date formatting
  const formatDate = (date: string, format = 'MMM DD, HH:mm') => {
    return dayjs(date).format(format);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case AGENT_APPLICATION_STATUS.PENDING:
        return theme.palette.warning.main;
      case AGENT_APPLICATION_STATUS.APPROVED:
        return theme.palette.success.main;
      case AGENT_APPLICATION_STATUS.REJECTED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getInquiryStatusColor = (status: string) => {
    switch (status) {
      case INQUIRY_STATUS.NEW:
        return theme.palette.info.main;
      case INQUIRY_STATUS.CONTACTED:
        return theme.palette.warning.main;
      case INQUIRY_STATUS.CLOSED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const recentInquiries = data?.recentInquiries || [];
  const recentAgentApplications = data?.recentAgentApplications || [];
  const recentRentals = data?.recentRentals || [];
  const topAgents = data?.topAgents || [];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="300" sx={{ color: 'text.primary', mb: 1 }}>
          {t('dashboard:activity_tabs.activity_summary')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Real-time activity across your platform
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            top: 0,
            bottom: 0,
            width: 2,
            background: `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            borderRadius: 1,
          }}
        />

        <Box sx={{ pl: 6 }}>
          {recentInquiries.slice(0, 3).map((inquiry) => (
            <Box key={`inquiry-${inquiry.id}`} sx={{ mb: 4, position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: -42,
                  top: 8,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: theme.palette.info.main,
                  border: '3px solid white',
                  boxShadow: `0 2px 8px ${theme.palette.info.main}30`,
                }}
              />
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 2,
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    border: `1px solid ${theme.palette.info.main}`,
                    boxShadow: `0 4px 12px ${theme.palette.info.main}20`,
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <EmailIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight="500" sx={{ color: 'text.primary' }}>
                    {t('dashboard:activity_tabs.recent_inquiries')}
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.info.main, fontWeight: '600' }}
                    >
                      {formatDate(inquiry.created_at)}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontWeight: '500', mb: 1 }}
                >
                  {inquiry.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {inquiry.message.substring(0, 80)}...
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      background: `${getInquiryStatusColor(inquiry.status)}15`,
                      border: `1px solid ${getInquiryStatusColor(inquiry.status)}30`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: getInquiryStatusColor(inquiry.status), fontWeight: '500' }}
                    >
                      {inquiry.status.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}

          {recentAgentApplications.slice(0, 3).map((application) => (
            <Box key={`application-${application.id}`} sx={{ mb: 4, position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: -42,
                  top: 8,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: theme.palette.success.main,
                  border: '3px solid white',
                  boxShadow: `0 2px 8px ${theme.palette.success.main}30`,
                }}
              />
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 2,
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    border: `1px solid ${theme.palette.success.main}`,
                    boxShadow: `0 4px 12px ${theme.palette.success.main}20`,
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <BusinessIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight="500" sx={{ color: 'text.primary' }}>
                    {t('dashboard:activity_tabs.agent_applications')}
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.success.main, fontWeight: '600' }}
                    >
                      {formatDate(application.created_at)}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontWeight: '500', mb: 1 }}
                >
                  {application.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {application.email || application.phone}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      background: `${getStatusColor(application.status)}15`,
                      border: `1px solid ${getStatusColor(application.status)}30`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: getStatusColor(application.status), fontWeight: '500' }}
                    >
                      {application.status}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}

          {recentRentals.slice(0, 3).map((rental) => (
            <Box key={`rental-${rental.id}`} sx={{ mb: 4, position: 'relative' }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: -42,
                  top: 8,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: theme.palette.warning.main,
                  border: '3px solid white',
                  boxShadow: `0 2px 8px ${theme.palette.warning.main}30`,
                }}
              />
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 2,
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    border: `1px solid ${theme.palette.warning.main}`,
                    boxShadow: `0 4px 12px ${theme.palette.warning.main}20`,
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <HomeIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight="500" sx={{ color: 'text.primary' }}>
                    {t('dashboard:activity_tabs.recent_rentals')}
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.warning.main, fontWeight: '600' }}
                    >
                      {formatDate(rental.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontWeight: '500', mb: 1 }}
                >
                  {getTranslatedText(rental.property.title)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {formatDate(rental.startDate, 'MMM DD, YYYY')} -{' '}
                  {formatDate(rental.endDate, 'MMM DD, YYYY')}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.warning.main, fontWeight: '600' }}
                  >
                    {(() => {
                      const startDate = dayjs(rental.startDate);
                      const endDate = dayjs(rental.endDate);
                      const durationDays = endDate.diff(startDate, 'day') + 1;

                      const isDailyRental = durationDays <= 30;

                      if (isDailyRental) {
                        const dailyPrice = parseFloat(rental.property.dailyPrice || '0');
                        const totalPrice = dailyPrice * durationDays;
                        return `${totalPrice} MAD`;
                      }
                      const monthlyPrice = parseFloat(rental.property.monthlyPrice || '0');
                      return `${monthlyPrice} MAD/month`;
                    })()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={4}>
          {[
            {
              icon: EmailIcon,
              count: recentInquiries.length,
              label: t('dashboard:activity_tabs.new_inquiries'),
              color: theme.palette.info.main,
            },
            {
              icon: BusinessIcon,
              count: recentAgentApplications.length,
              label: t('dashboard:activity_tabs.agent_applications_count'),
              color: theme.palette.success.main,
            },
            {
              icon: HomeIcon,
              count: recentRentals.length,
              label: t('dashboard:activity_tabs.recent_rentals_count'),
              color: theme.palette.warning.main,
            },
            {
              icon: BusinessIcon,
              count: topAgents.length,
              label: t('dashboard:activity_tabs.active_agents'),
              color: theme.palette.primary.main,
            },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <stat.icon sx={{ color: stat.color, fontSize: 24 }} />
                </Box>
                <Typography variant="h4" fontWeight="300" sx={{ color: stat.color, mb: 0.5 }}>
                  {stat.count}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: '400' }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default RecentActivity;
