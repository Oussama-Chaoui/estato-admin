import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  IconButton,
  Avatar,
  useTheme,
  Tooltip,
  Grid,
  ButtonBase,
  Chip,
} from '@mui/material';
import {
  CalendarToday,
  Edit,
  Delete,
  AccessTime,
  CheckCircle,
  Cancel,
  CalendarMonth,
  Today,
} from '@mui/icons-material';
import { Rental } from '@modules/rentals/hooks/api/useRentals';
import { RENTAL_TYPE } from '@modules/properties/defs/types';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface Props {
  rental: Rental;
  onEdit: (rental: Rental) => void;
  onDelete: (rental: Rental) => void;
  getStatusColor: (rental: Rental) => 'primary' | 'success' | 'default';
  getStatusLabel: (rental: Rental) => string;
  currency: string;
}

const RentalCard = ({
  rental,
  onEdit,
  onDelete,
  getStatusColor,
  getStatusLabel,
  currency,
}: Props) => {
  const theme = useTheme();
  const { t } = useTranslation(['property']);

  const startDate = dayjs(rental.startDate);
  const endDate = dayjs(rental.endDate);

  const getDurationInfo = () => {
    if (rental.type === RENTAL_TYPE.MONTHLY) {
      const months = endDate.diff(startDate, 'month', true);
      const roundedMonths = Math.round(months * 10) / 10;
      return {
        value: roundedMonths,
        unit:
          roundedMonths === 1
            ? t('property:booking_calendar.month').toLowerCase()
            : t('property:booking_calendar.months').toLowerCase(),
        display: `${roundedMonths} ${
          roundedMonths === 1
            ? t('property:booking_calendar.month').toLowerCase()
            : t('property:booking_calendar.months').toLowerCase()
        }`,
      };
    }
    const days = Math.max(1, endDate.diff(startDate, 'day'));
    return {
      value: days,
      unit:
        days === 1
          ? t('property:rental_management.day').toLowerCase()
          : t('property:rental_management.days').toLowerCase(),
      display: `${days} ${
        days === 1
          ? t('property:rental_management.day').toLowerCase()
          : t('property:rental_management.days').toLowerCase()
      }`,
    };
  };

  const durationInfo = getDurationInfo();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  const clientName = rental.renter?.user?.name || t('property:rental_management.unknown_client');

  const getRentalTypeInfo = () => {
    if (rental.type === RENTAL_TYPE.MONTHLY) {
      return {
        label: t('property:rental_types.monthly'),
        icon: <CalendarMonth sx={{ fontSize: 14 }} />,
        color: 'secondary' as const,
        priceUnit: t('property:rental_management.per_month'),
      };
    }
    return {
      label: t('property:rental_types.daily'),
      icon: <Today sx={{ fontSize: 14 }} />,
      color: 'primary' as const,
      priceUnit: t('property:rental_management.per_day'),
    };
  };

  const rentalTypeInfo = getRentalTypeInfo();

  const getStatusIcon = () => {
    const now = dayjs();
    const start = dayjs(rental.startDate);
    const end = dayjs(rental.endDate);

    if (now.isBefore(start)) {
      return <CalendarToday sx={{ fontSize: 16 }} />;
    }
    if (now.isBetween(start, end, null, '[]')) {
      return <CheckCircle sx={{ fontSize: 16 }} />;
    }
    return <Cancel sx={{ fontSize: 16 }} />;
  };

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: theme.shadows[2],
          borderColor: 'primary.main',
        },
      }}
    >
      <ButtonBase sx={{ width: '100%', textAlign: 'left' }}>
        <CardContent sx={{ p: 2, width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    bgcolor: (() => {
                      const statusColor = getStatusColor(rental);
                      if (statusColor === 'success') {
                        return 'success.main';
                      }
                      if (statusColor === 'primary') {
                        return 'primary.main';
                      }
                      return 'grey.400';
                    })(),
                    width: 36,
                    height: 36,
                    fontSize: 14,
                  }}
                >
                  {getInitials(clientName)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {clientName}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {getStatusIcon()}
                    <Typography variant="caption" color="text.secondary">
                      {getStatusLabel(rental)}
                    </Typography>
                  </Stack>
                  <Chip
                    icon={rentalTypeInfo.icon}
                    label={rentalTypeInfo.label}
                    size="small"
                    color={rentalTypeInfo.color}
                    sx={{
                      mt: 0.5,
                      height: 20,
                      fontSize: '0.7rem',
                      '& .MuiChip-icon': { fontSize: '12px' },
                    }}
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {dayjs(rental.startDate).format('MMM DD')} -{' '}
                  {dayjs(rental.endDate).format('MMM DD, YYYY')}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {durationInfo.display}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {currency} {rental.price.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currency} {Math.round(rental.price / durationInfo.value).toLocaleString()}
                  {rentalTypeInfo.priceUnit}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {rental.agent && (
                    <Stack spacing={0.5}>
                      <Typography variant="caption" fontWeight={600} color="text.primary">
                        {rental.agent.user?.name || t('property:rental_management.unknown_agent')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rental.agent.agencyName || ''}
                      </Typography>
                    </Stack>
                  )}
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={t('property:rental_management.edit')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(rental);
                      }}
                      sx={{
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'primary.light' },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('property:rental_management.delete')}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(rental);
                      }}
                      sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.lighter' },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </ButtonBase>
    </Card>
  );
};

export default RentalCard;
