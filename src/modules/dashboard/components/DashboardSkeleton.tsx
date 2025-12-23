import React from 'react';
import { Box, Container, Grid, Paper, Skeleton, Card, CardContent, useTheme } from '@mui/material';

const StatCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette.primary.light}10 0%, ${theme.palette.background.default} 100%)`,
        border: `1px solid ${theme.palette.primary.light}20`,
        borderRadius: 3,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              backgroundColor: theme.palette.primary.light + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
        </Box>

        <Skeleton
          variant="text"
          width="60%"
          height={60}
          sx={{
            fontSize: '2.5rem',
            mb: 1,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}20 25%, ${theme.palette.primary.main}40 50%, ${theme.palette.primary.main}20 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
        />

        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 2 }} />

        <Box mb={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="20%" height={20} />
          </Box>
          <Skeleton
            variant="rectangular"
            height={6}
            sx={{
              borderRadius: 3,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}20 25%, ${theme.palette.primary.main}40 50%, ${theme.palette.primary.main}20 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
        </Box>

        <Skeleton variant="text" width="60%" height={16} />
      </CardContent>
    </Card>
  );
};

const QuickActionSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton
                variant="rectangular"
                height={120}
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}10 25%, ${theme.palette.primary.main}20 50%, ${theme.palette.primary.main}10 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                }}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

interface ChartSkeletonProps {
  height?: number;
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height = 350 }) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: height + 100 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
        <Skeleton
          variant="rectangular"
          height={height}
          sx={{
            borderRadius: 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}10 25%, ${theme.palette.primary.main}20 50%, ${theme.palette.primary.main}10 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
        />
      </CardContent>
    </Card>
  );
};

const ActivityItemSkeleton: React.FC = () => (
  <Box display="flex" alignItems="center" mb={2}>
    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
    <Box flex={1}>
      <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="50%" height={16} />
    </Box>
    <Skeleton variant="text" width="20%" height={16} />
  </Box>
);

const ActivitySkeleton: React.FC = () => (
  <Card sx={{ height: 400 }}>
    <CardContent>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
      {Array.from({ length: 6 }).map((_, index) => (
        <ActivityItemSkeleton key={index} />
      ))}
    </CardContent>
  </Card>
);

const DashboardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}05 100%)`,
        pb: 6,
        '@keyframes shimmer': {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Header Skeleton */}
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
              <Skeleton
                variant="text"
                width={400}
                height={60}
                sx={{
                  fontSize: '3rem',
                  mb: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}20 25%, ${theme.palette.primary.main}40 50%, ${theme.palette.primary.main}20 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                }}
              />
              <Skeleton variant="text" width={600} height={32} />
            </Box>
            <Skeleton
              variant="rectangular"
              width={140}
              height={48}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}20 25%, ${theme.palette.primary.main}40 50%, ${theme.palette.primary.main}20 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
              }}
            />
          </Box>
        </Paper>

        {/* Tab Navigation Skeleton */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: '10px 10px 0 0',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
                flex: 1,
                pointerEvents: 'none',
                cursor: 'default',
              },
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 2,
                  px: 2,
                  borderBottom:
                    index === 0
                      ? `3px solid ${theme.palette.primary.main}`
                      : '3px solid transparent',
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Skeleton variant="circular" width={20} height={20} />
                  <Skeleton variant="text" width={80} height={24} />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Overview Tab Content */}
        <Box sx={{ py: 3 }}>
          {/* Quick Actions Skeleton */}
          <Box mb={4}>
            <QuickActionSkeleton />
          </Box>

          {/* Statistics Cards Skeleton */}
          <Grid container spacing={3} mb={4}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Analytics Tab Content (Hidden but skeleton ready) */}
        <Box sx={{ py: 3, display: 'none' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <ChartSkeleton height={350} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <ChartSkeleton height={350} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <ChartSkeleton height={300} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <ChartSkeleton height={300} />
            </Grid>
            <Grid item xs={12}>
              <ChartSkeleton height={300} />
            </Grid>
          </Grid>
        </Box>

        {/* Activity Tab Content (Hidden but skeleton ready) */}
        <Box sx={{ py: 3, display: 'none' }}>
          <ActivitySkeleton />
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardSkeleton;
