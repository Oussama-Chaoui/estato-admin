import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  useTheme,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  ViewInAr as ViewInArIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DashboardStatistics } from '@modules/dashboard/defs/types';

interface StatisticsCardsProps {
  statistics: DashboardStatistics;
}

interface CardData {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  progress: number;
  progressLabel?: string;
  trend?: number;
  trendLabel?: string;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics }) => {
  const theme = useTheme();
  const { t } = useTranslation(['dashboard', 'common']);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth >= 0) {
      return theme.palette.success.main;
    }
    return theme.palette.error.main;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />;
  };

  const propertyUtilizationRate = statistics.propertyUtilizationRate || 0;

  const calculateUtilizationGrowth = () => {
    const lastMonthRate = statistics.propertyUtilizationBreakdown.lastMonthUtilizationRate;
    if (lastMonthRate > 0) {
      return ((propertyUtilizationRate - lastMonthRate) / lastMonthRate) * 100;
    }
    if (propertyUtilizationRate > 0) {
      return 100;
    }
    return 0;
  };

  const utilizationGrowth = calculateUtilizationGrowth();

  const renderProgressValue = (card: CardData) => {
    const progressValue = (
      <Typography variant="caption" color="text.secondary" fontWeight="600">
        {card.progress.toFixed(1)}%
      </Typography>
    );

    const tooltipProgressValue = (
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight="600"
        sx={{
          cursor: 'help',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
        }}
      >
        {card.progress.toFixed(1)}%
      </Typography>
    );

    if (card.title === t('dashboard:total_properties')) {
      return (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {t('dashboard:property_utilization')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {statistics.propertyUtilizationBreakdown.availableProperties}{' '}
                {t('dashboard:properties_available_for_rent')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:current_period')}:{' '}
                {statistics.propertyUtilizationBreakdown.monthStart} to{' '}
                {statistics.propertyUtilizationBreakdown.currentDate}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:available')}:{' '}
                {statistics.propertyUtilizationBreakdown.totalAvailableDays}{' '}
                {t('dashboard:rental_days')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:rented')}: {statistics.propertyUtilizationBreakdown.actualRentedDays}{' '}
                {t('dashboard:days')}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="body2" fontWeight="bold">
                  {t('dashboard:current')}: {propertyUtilizationRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard:last_month')}:{' '}
                  {statistics.propertyUtilizationBreakdown.lastMonthUtilizationRate.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          }
          arrow
          placement="top"
        >
          {tooltipProgressValue}
        </Tooltip>
      );
    }

    if (card.title === t('dashboard:total_users')) {
      return (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {t('dashboard:client_growth')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:total_clients')}: {statistics.clientGrowthBreakdown.totalClients}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:current_period')}:{' '}
                {statistics.clientGrowthBreakdown.currentMonthStart} to{' '}
                {statistics.clientGrowthBreakdown.currentMonthEnd}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:new_clients')}: {statistics.clientGrowthBreakdown.currentMonthClients}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:last_month_period')}:{' '}
                {statistics.clientGrowthBreakdown.lastMonthStart} to{' '}
                {statistics.clientGrowthBreakdown.lastMonthEnd}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:last_month_clients')}:{' '}
                {statistics.clientGrowthBreakdown.lastMonthClients}
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                {t('dashboard:growth')}: {statistics.clientGrowthBreakdown.clientsGrowth.toFixed(1)}
                %
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          {tooltipProgressValue}
        </Tooltip>
      );
    }

    if (card.title === t('dashboard:active_agents')) {
      return (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {t('dashboard:activity_rate_growth')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:total_agents')}: {statistics.agentActivityBreakdown.totalAgents}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:current_period')}:{' '}
                {statistics.agentActivityBreakdown.currentMonthStart} to{' '}
                {statistics.agentActivityBreakdown.currentMonthEnd}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:active_agents_this_month')}:{' '}
                {statistics.agentActivityBreakdown.activeAgentsThisMonth}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:activity_rate')}:{' '}
                {statistics.agentActivityBreakdown.currentMonthActivityRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:last_month_period')}:{' '}
                {statistics.agentActivityBreakdown.lastMonthStart} to{' '}
                {statistics.agentActivityBreakdown.lastMonthEnd}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:last_month_active')}:{' '}
                {statistics.agentActivityBreakdown.activeAgentsLastMonth}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:last_month_rate')}:{' '}
                {statistics.agentActivityBreakdown.lastMonthActivityRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                {t('dashboard:growth')}:{' '}
                {statistics.agentActivityBreakdown.activityGrowth.toFixed(1)}%
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          {tooltipProgressValue}
        </Tooltip>
      );
    }

    if (card.title === t('dashboard:featured_properties')) {
      return (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {t('dashboard:property_portfolio_health')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:total_properties')}: {statistics.totalProperties}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:for_sale')}: {statistics.forSaleProperties}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:for_rent')}: {statistics.forRentProperties}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:sold')}: {statistics.soldProperties}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:rented_properties')}: {statistics.rentedProperties}
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                {t('dashboard:featured')}: {statistics.featuredProperties} (
                {card.progress.toFixed(1)}%)
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          {tooltipProgressValue}
        </Tooltip>
      );
    }

    if (card.title === t('dashboard:agent_applications')) {
      return (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {t('dashboard:agent_application_status')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:total_applications')}: {statistics.totalAgentApplications}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:pending')}: {statistics.pendingAgentApplications}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:approved')}: {statistics.approvedAgentApplications}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:rejected')}: {statistics.rejectedAgentApplications}
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                {t('dashboard:pending_rate')}: {card.progress.toFixed(1)}%
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          {tooltipProgressValue}
        </Tooltip>
      );
    }

    if (card.title === t('dashboard:vr_properties')) {
      return (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {t('dashboard:virtual_reality_coverage')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:total_properties')}: {statistics.totalProperties}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:with_vr_tours')}: {statistics.vrProperties}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:without_vr')}: {statistics.totalProperties - statistics.vrProperties}
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                {t('dashboard:vr_coverage')}: {card.progress.toFixed(1)}%
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          {tooltipProgressValue}
        </Tooltip>
      );
    }

    if (card.title === t('dashboard:blog_posts')) {
      return (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                {t('dashboard:content_management_status')}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:total_posts')}: {statistics.totalPosts}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:published')}: {statistics.publishedPosts}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:drafts')}: {statistics.draftPosts}
              </Typography>
              <Typography variant="body2" mb={0.5}>
                {t('dashboard:archived')}: {statistics.archivedPosts}
              </Typography>
              <Typography variant="body2" fontWeight="bold" mt={1}>
                {t('dashboard:publish_rate')}: {card.progress.toFixed(1)}%
              </Typography>
            </Box>
          }
          arrow
          placement="top"
        >
          {tooltipProgressValue}
        </Tooltip>
      );
    }

    return progressValue;
  };

  const cards = [
    {
      title: t('dashboard:total_properties'),
      value: formatNumber(statistics.totalProperties),
      icon: <HomeIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light + '20',
      description: t('dashboard:active_listings'),
      progress: propertyUtilizationRate,
      progressLabel: t('dashboard:utilization_rate'),
      trend: utilizationGrowth,
    },
    {
      title: t('dashboard:total_users'),
      value: formatNumber(statistics.totalUsers),
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + '20',
      description: t('dashboard:registered_users'),
      progress: statistics.clientsGrowth,
      progressLabel: t('dashboard:client_growth'),
      trend: statistics.clientsGrowth,
      trendLabel: t('dashboard:vs_last_month'),
    },
    {
      title: t('dashboard:active_agents'),
      value: formatNumber(statistics.totalAgents),
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light + '20',
      description: t('dashboard:licensed_agents'),
      progress: statistics.agentActivityGrowth,
      progressLabel: t('dashboard:activity_rate_growth'),
      trend: statistics.agentsGrowth,
      trendLabel: t('dashboard:vs_last_month'),
    },
    {
      title: t('dashboard:monthly_revenue'),
      value: formatCurrency(statistics.monthlyRevenue),
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + '20',
      trend: statistics.revenueGrowth,
      trendLabel: t('dashboard:vs_last_month'),
      description: t('dashboard:this_month'),
      progress: statistics.revenueKpiProgress,
      progressLabel: t('dashboard:kpi_progress'),
    },
    {
      title: t('dashboard:featured_properties'),
      value: formatNumber(statistics.featuredProperties),
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      bgColor: theme.palette.warning.light + '20',
      description: t('dashboard:premium_listings'),
      progress:
        statistics.totalProperties > 0
          ? (statistics.featuredProperties / statistics.totalProperties) * 100
          : 0,
      progressLabel: t('dashboard:featured_ratio'),
      trend: statistics.featuredPropertiesGrowth,
      trendLabel: t('dashboard:vs_total_properties'),
    },
    {
      title: t('dashboard:agent_applications'),
      value: formatNumber(statistics.pendingAgentApplications),
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light + '20',
      description: t('dashboard:pending_review'),
      progress:
        statistics.totalAgentApplications > 0
          ? (statistics.pendingAgentApplications / statistics.totalAgentApplications) * 100
          : 0,
      progressLabel: t('dashboard:pending_rate'),
      trend: statistics.agentApplicationsGrowth,
      trendLabel: t('dashboard:vs_total_applications'),
    },
    {
      title: t('dashboard:vr_properties'),
      value: formatNumber(statistics.vrProperties),
      icon: <ViewInArIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      bgColor: theme.palette.secondary.light + '20',
      description: t('dashboard:virtual_tours'),
      progress:
        statistics.totalProperties > 0
          ? (statistics.vrProperties / statistics.totalProperties) * 100
          : 0,
      progressLabel: t('dashboard:vr_coverage'),
      trend: statistics.vrPropertiesGrowth,
      trendLabel: t('dashboard:vs_total_properties'),
    },
    {
      title: t('dashboard:blog_posts'),
      value: formatNumber(statistics.publishedPosts),
      icon: <ArticleIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light + '20',
      description: t('dashboard:published_content'),
      progress:
        statistics.totalPosts > 0 ? (statistics.publishedPosts / statistics.totalPosts) * 100 : 0,
      progressLabel: t('dashboard:publish_rate'),
      trend: statistics.publishedPostsGrowth,
      trendLabel: t('dashboard:vs_total_posts'),
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.bgColor}00 100%)`,
              border: `1px solid ${card.color}30`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: `0 12px 40px ${card.color}30`,
                borderColor: card.color,
                '& .card-icon': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
                '& .progress-bar': {
                  width: '100%',
                },
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}80 100%)`,
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease',
              },
              '&:hover::before': {
                transform: 'scaleX(1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box
                  className="card-icon"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: card.color + '15',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                {card.trend !== undefined && (
                  <Chip
                    icon={getGrowthIcon(card.trend)}
                    label={`${card.trend >= 0 ? '+' : ''}${card.trend.toFixed(1)}%`}
                    size="small"
                    sx={{
                      backgroundColor: getGrowthColor(card.trend) + '15',
                      color: getGrowthColor(card.trend),
                      border: `1px solid ${getGrowthColor(card.trend)}30`,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              <Typography
                variant="h3"
                component="div"
                fontWeight="bold"
                color={card.color}
                mb={1}
                sx={{
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                  lineHeight: 1.2,
                }}
              >
                {card.value}
              </Typography>

              <Typography
                variant="h6"
                color="text.primary"
                fontWeight="600"
                mb={0.5}
                sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
              >
                {card.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={2}
                sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
              >
                {card.description}
              </Typography>

              <Box mb={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {card.progressLabel || t('dashboard:performance')}
                  </Typography>
                  {renderProgressValue(card)}
                </Box>
                <LinearProgress
                  className="progress-bar"
                  variant="determinate"
                  value={card.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: card.color + '20',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}80 100%)`,
                      transition: 'width 0.3s ease',
                    },
                  }}
                />
              </Box>

              {card.trendLabel && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: '0.75rem',
                    opacity: 0.8,
                  }}
                >
                  {card.trendLabel}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsCards;
