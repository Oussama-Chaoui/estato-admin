import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  Chip,
  IconButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { Info as InfoIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DashboardData } from '@modules/dashboard/defs/types';
import { useTranslatedText } from '../../../common/utils/translations';

interface DashboardChartsProps {
  data: DashboardData;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  formatCompactCurrency: (amount: number) => string;
  formatCompactNumber: (amount: number) => string;
  t: (key: string) => string;
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  propertyTypesData: Array<{ name: string; value: number; fill: string }>;
  t: (key: string) => string;
}

const CustomTooltipComponent: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatCompactCurrency,
  formatCompactNumber,
  t,
}) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          boxShadow: 4,
          minWidth: 200,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" mb={1} color="primary">
          {label}
        </Typography>
        {payload.map((entry: TooltipPayloadEntry, index: number) => {
          let displayName = entry.name;
          if (entry.name === 'Sales Revenue') {
            displayName = t('dashboard:sales');
          } else if (entry.name === 'Rental Revenue') {
            displayName = t('dashboard:rental');
          } else if (entry.name === 'Total Revenue') {
            displayName = t('dashboard:total');
          }

          return (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ color: entry.color, fontWeight: 500 }}>
                  {displayName}:
                </Typography>
              </Box>
              <Box ml={3}>
                <Typography variant="body2" fontWeight="bold">
                  {entry.name === 'Revenue' ||
                  entry.name === 'revenue' ||
                  entry.name === 'Sales Revenue' ||
                  entry.name === 'Rental Revenue' ||
                  entry.name === 'Total Revenue' ||
                  entry.name === t('dashboard:sales_revenue') ||
                  entry.name === t('dashboard:rental_revenue') ||
                  entry.name === t('dashboard:total_revenue') ||
                  entry.name === t('dashboard:revenue')
                    ? formatCompactCurrency(entry.value)
                    : formatCompactNumber(entry.value)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }
  return null;
};

const CustomPieTooltipComponent: React.FC<CustomPieTooltipProps> = ({
  active,
  payload,
  propertyTypesData,
  t,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = propertyTypesData.reduce((sum, item) => sum + item.value, 0);
    const percentage = total > 0 ? (data.value / total) * 100 : 0;

    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          boxShadow: 4,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
          {data.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dashboard:count')}: {data.value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dashboard:percentage')}: {percentage.toFixed(1)}%
        </Typography>
      </Box>
    );
  }
  return null;
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  const theme = useTheme();
  const { t } = useTranslation(['dashboard', 'common']);
  const getTranslatedText = useTranslatedText();

  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formattedNumber} MAD`;
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M MAD`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K MAD`;
    }
    return `${amount.toFixed(0)} MAD`;
  };

  const formatCompactNumber = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const propertyTypesData = React.useMemo(() => {
    if (!data.propertyTypeStats || data.propertyTypeStats.length === 0) {
      return [{ name: t('dashboard:no_data'), value: 1, fill: theme.palette.grey[400] }];
    }

    return data.propertyTypeStats.map(({ type, count }, index) => ({
      name: t(`dashboard:property_types.${type}`),
      value: count,
      fill: COLORS[index % COLORS.length],
    }));
  }, [data.propertyTypeStats, theme.palette.grey, COLORS, t]);

  const monthlyTrendsData = (data.monthlyTrends || []).map((trend) => ({
    month: trend.month,
    properties: trend.properties,
    rentals: trend.rentals,
    revenue: trend.revenue,
    inquiries: trend.inquiries,
    conversionRate: trend.rentals > 0 ? (trend.rentals / trend.inquiries) * 100 : 0,
    avgRevenue: trend.rentals > 0 ? trend.revenue / trend.rentals : 0,
  }));

  const topAgentsData = (data.topAgents || []).map((agent) => {
    const mappedData = {
      name: agent.user?.name || t('dashboard:unknown_agent'),
      rentals: agent.rentalsCount || 0,
      agency: agent.agencyName || t('dashboard:unknown_agency'),
      totalRevenue: agent.rentals
        ? agent.rentals.reduce((sum, rental) => sum + parseFloat(rental.price || '0'), 0)
        : 0,
      avgRentalPrice:
        agent.rentals && agent.rentals.length > 0
          ? agent.rentals.reduce((sum, rental) => sum + parseFloat(rental.price || '0'), 0) /
            agent.rentals.length
          : 0,
    };
    return mappedData;
  });

  const sortedTopAgentsData = topAgentsData.sort((a, b) => b.rentals - a.rentals).slice(0, 5);

  const topLocationsData =
    data.topLocations && data.topLocations.length > 0
      ? data.topLocations.map((location) => ({
          name: getTranslatedText(location.location?.city?.names) || t('dashboard:unknown_city'),
          properties: location.count || 0,
        }))
      : [{ name: t('dashboard:no_data'), properties: 0 }];

  const revenueComparisonData = React.useMemo(() => {
    const monthlyData =
      data.monthlyTrends?.map((trend) => ({
        month: trend.month,
        salesRevenue: trend.salesRevenue || 0,
        rentalRevenue: trend.rentalRevenue || trend.revenue || 0,
        totalRevenue: trend.revenue || 0,
        salesCount: Math.floor(trend.properties * 0.2),
        rentalCount: trend.rentals,
      })) || [];

    return monthlyData;
  }, [data.monthlyTrends]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Card sx={{ height: 450 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {t('dashboard:monthly_performance_trends')}
              </Typography>
              <MuiTooltip title={t('dashboard:monthly_trends_tooltip')}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(value) => {
                    const [month, year] = value.split(' ');
                    return `${t(`dashboard:months.${month}`)} ${year}`;
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    }
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}K`;
                    }
                    return `${value}`;
                  }}
                />
                <Tooltip
                  content={
                    <CustomTooltipComponent
                      formatCompactCurrency={formatCompactCurrency}
                      formatCompactNumber={formatCompactNumber}
                      t={t}
                    />
                  }
                />
                <Legend />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.warning.main}
                  fill={theme.palette.warning.light + '40'}
                  strokeWidth={2}
                  name={t('dashboard:revenue')}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="properties"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  name={t('dashboard:properties')}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rentals"
                  stroke={theme.palette.success.main}
                  strokeWidth={3}
                  name={t('dashboard:rentals')}
                  dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="inquiries"
                  stroke={theme.palette.info.main}
                  strokeWidth={3}
                  name={t('dashboard:inquiries')}
                  dot={{ fill: theme.palette.info.main, strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card sx={{ height: 450 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {t('dashboard:property_types_distribution')}
              </Typography>
              <MuiTooltip title={t('dashboard:property_types_tooltip')}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={propertyTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {propertyTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomPieTooltipComponent propertyTypesData={propertyTypesData} t={t} />
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{
                    paddingTop: '5px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {t('dashboard:top_performing_agents')}
              </Typography>
              <MuiTooltip title={t('dashboard:top_agents_tooltip')}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sortedTopAgentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  stroke={theme.palette.text.secondary}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  domain={[0, 3]}
                  ticks={[0, 1, 2, 3]}
                />
                <Tooltip
                  content={
                    <CustomTooltipComponent
                      formatCompactCurrency={formatCompactCurrency}
                      formatCompactNumber={formatCompactNumber}
                      t={t}
                    />
                  }
                />
                <Bar
                  dataKey="rentals"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  name={t('dashboard:rentals')}
                />
              </BarChart>
            </ResponsiveContainer>
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              justifyContent="space-evenly"
              mt={3}
              px={1}
              sx={{ flex: 1 }}
            >
              {sortedTopAgentsData.map((agent, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      color={index === 0 ? 'primary' : 'default'}
                      sx={{ mr: 1.5, minWidth: 35 }}
                    />
                    <Typography variant="body2" noWrap sx={{ maxWidth: 100, fontWeight: 500 }}>
                      {agent.name}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {agent.rentals} {t('dashboard:rentals_count')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(agent.totalRevenue)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {t('dashboard:properties_by_location')}
              </Typography>
              <MuiTooltip title={t('dashboard:properties_location_tooltip')}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topLocationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  stroke={theme.palette.text.secondary}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  allowDecimals={false}
                  domain={[0, 'dataMax + 1']}
                />
                <Tooltip
                  content={
                    <CustomTooltipComponent
                      formatCompactCurrency={formatCompactCurrency}
                      formatCompactNumber={formatCompactNumber}
                      t={t}
                    />
                  }
                />
                <Bar
                  dataKey="properties"
                  fill={theme.palette.success.main}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  name={t('dashboard:properties')}
                />
              </BarChart>
            </ResponsiveContainer>

            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              justifyContent="space-evenly"
              mt={3}
              px={1}
              sx={{ flex: 1 }}
            >
              {topLocationsData.map((location, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Box display="flex" alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      color={index === 0 ? 'success' : 'default'}
                      sx={{ mr: 1.5, minWidth: 35, flexShrink: 0 }}
                    />
                    <Typography variant="body2" noWrap sx={{ maxWidth: 100, fontWeight: 500 }}>
                      {location.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {location.properties} {t('dashboard:properties_count')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ height: 400 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {t('dashboard:sales_vs_rentals_revenue')}
              </Typography>
              <MuiTooltip title={t('dashboard:sales_rentals_tooltip')}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(value) => {
                    const [month, year] = value.split(' ');
                    return `${t(`dashboard:months.${month}`)} ${year}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    }
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(0)}K`;
                    }
                    return `${value}`;
                  }}
                />
                <Tooltip
                  content={
                    <CustomTooltipComponent
                      formatCompactCurrency={formatCompactCurrency}
                      formatCompactNumber={formatCompactNumber}
                      t={t}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="salesRevenue"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard:sales_revenue')}
                  stackId="revenue"
                />
                <Bar
                  dataKey="rentalRevenue"
                  fill={theme.palette.success.main}
                  radius={[4, 4, 0, 0]}
                  name={t('dashboard:rental_revenue')}
                  stackId="revenue"
                />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke={theme.palette.warning.main}
                  strokeWidth={3}
                  name={t('dashboard:total_revenue')}
                  dot={{ fill: theme.palette.warning.main, strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardCharts;
