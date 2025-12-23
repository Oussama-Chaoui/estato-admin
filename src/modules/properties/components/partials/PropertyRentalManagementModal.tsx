import {
  Modal,
  Button,
  Stack,
  Box,
  Typography,
  Avatar,
  useTheme,
  Alert,
  CircularProgress,
  Grid,
  alpha,
} from '@mui/material';
import { Close, Home, Add, Person, Phone, CreditCard, Email } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Property, RENTAL_TYPE } from '@modules/properties/defs/types';
import useRentals, { Rental } from '@modules/rentals/hooks/api/useRentals';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import RHFRadioGroup from '@common/components/lib/react-hook-form/RHFRadioGroup';
import RentalCard from './RentalCard';
import AvailabilityDatePicker from './AvailabilityDatePicker';
import { useDialogContext } from '@common/contexts/DialogContext';
import useAuth from '@modules/auth/hooks/api/useAuth';

dayjs.extend(isBetween);

export interface BookingFormValues {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  numberOfMonths: number;
  rentType: RENTAL_TYPE;
  name: string;
  email: string;
  phone: string;
  nicNumber?: string;
  passport?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  property: Property;
}

const PropertyRentalManagementModal = ({ open, onClose, property }: Props) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['property']);

  // Set dayjs locale based on current language
  dayjs.locale(i18n.language);
  const { openConfirmDialog } = useDialogContext();

  const { readAll, deleteOne, updateOne, createOne } = useRentals();
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(dayjs());
  const [viewMode, setViewMode] = useState(true);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);

  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(null);

  const availableRentTypes: Array<{ label: string; value: RENTAL_TYPE }> = [];
  if (property.dailyPriceEnabled) {
    availableRentTypes.push({ label: t('property:rental_types.daily'), value: RENTAL_TYPE.DAILY });
  }
  if (property.monthlyPriceEnabled) {
    availableRentTypes.push({
      label: t('property:rental_types.monthly'),
      value: RENTAL_TYPE.MONTHLY,
    });
  }

  const methods = useForm<BookingFormValues>({
    defaultValues: {
      startDate: null,
      endDate: null,
      numberOfMonths: 1,
      rentType: RENTAL_TYPE.DAILY,
      name: '',
      email: '',
      phone: '',
      nicNumber: '',
      passport: '',
    },
    mode: 'onChange',
    resolver: yupResolver(
      yup
        .object()
        .shape({
          rentType: yup.string().required('Rental type is required'),
          name: yup.string().required('Full name is required'),
          email: yup.string().email('Invalid email format').required('Email is required'),
          phone: yup.string().required('Phone number is required'),
          nicNumber: yup.string().optional(),
          passport: yup.string().optional(),
          numberOfMonths: yup.number().when('rentType', {
            is: RENTAL_TYPE.MONTHLY,
            then: (schema) =>
              schema
                .required('Number of months is required')
                .min(1, 'Minimum 1 month')
                .max(12, 'Maximum 12 months'),
            otherwise: (schema) => schema.optional(),
          }),
        })
        .test({
          name: 'nic-or-passport',
          message: 'Either NIC number or passport is required',
          test(_value, context) {
            const { nicNumber, passport } = context.parent;
            const hasNic = nicNumber && nicNumber.trim() !== '';
            const hasPassport = passport && passport.trim() !== '';

            if (!hasNic && !hasPassport) {
              return context.createError({
                message: 'Either NIC number or passport is required',
                path: 'nicNumber',
              });
            }
            return true;
          },
        })
        .when('rentType', {
          is: RENTAL_TYPE.DAILY,
          then: (schema) =>
            schema.shape({
              startDate: yup.mixed().required('Start date is required'),
              endDate: yup
                .mixed()
                .required('End date is required')
                .test({
                  name: 'end-date-after-start',
                  message: 'End date must be after start date',
                  test(value, context) {
                    const { startDate } = context.parent;
                    if (!startDate || !value) {
                      return true;
                    }
                    return dayjs(value as Dayjs).isAfter(dayjs(startDate as Dayjs));
                  },
                }),
            }),
          otherwise: (schema) =>
            schema.shape({
              startDate: yup.mixed().required('Start date is required'),
              numberOfMonths: yup
                .number()
                .required('Number of months is required')
                .min(1, 'Minimum 1 month')
                .max(12, 'Maximum 12 months'),
            }),
        })
    ),
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { isSubmitting },
  } = methods;

  const watchRentType = watch('rentType');
  const watchStartDate = watch('startDate');
  const watchNumberOfMonths = watch('numberOfMonths');

  const handleRentTypeChange = (newRentType: RENTAL_TYPE) => {
    setValue('rentType', newRentType);

    methods.clearErrors();
    trigger();

    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleNumberOfMonthsChange = (months: number) => {
    if (watchStartDate && watchRentType === RENTAL_TYPE.MONTHLY) {
      const newEndDate = dayjs(watchStartDate).add(months, 'month');
      setSelectedEndDate(newEndDate);
      setValue('endDate', newEndDate);
    }
  };

  const filterRentalsForCurrentMonth = (allRentals: Rental[], month: Dayjs) => {
    const monthStart = month.startOf('month');
    const monthEnd = month.endOf('month');

    return allRentals.filter((rental) => {
      const rentalStart = dayjs(rental.startDate);
      const rentalEnd = dayjs(rental.endDate);

      return (
        rentalStart.isBetween(monthStart, monthEnd, 'day', '[]') ||
        rentalEnd.isBetween(monthStart, monthEnd, 'day', '[]') ||
        (rentalStart.isBefore(monthStart) && rentalEnd.isAfter(monthEnd))
      );
    });
  };

  const fetchAllRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = [
        {
          filterColumn: 'property_id',
          filterOperator: 'equals',
          filterValue: property.id,
        },
      ];

      const response = await readAll(1, 1000, undefined, filters);

      if (response.success) {
        const allRentals = response.data?.items || [];
        setRentals(allRentals);

        const filtered = filterRentalsForCurrentMonth(allRentals, currentCalendarMonth);
        setFilteredRentals(filtered);
      } else {
        setError(t('property:rental_management.fetch_error'));
      }
    } catch (err) {
      setError(t('property:rental_management.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarMonthChange = (newMonth: Dayjs) => {
    setCurrentCalendarMonth(newMonth);
    const filtered = filterRentalsForCurrentMonth(rentals, newMonth);
    setFilteredRentals(filtered);
  };

  const handleDateRangeSelect = (startDate: Dayjs | null, endDate?: Dayjs | null) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate || null);

    setValue('startDate', startDate);
    if (endDate) {
      setValue('endDate', endDate);
    }

    if (startDate && watchRentType === RENTAL_TYPE.MONTHLY && watchNumberOfMonths) {
      const newEndDate = startDate.add(watchNumberOfMonths, 'month');
      setSelectedEndDate(newEndDate);
    }
  };

  useEffect(() => {
    if (open && property?.id) {
      setRentals([]);
      setFilteredRentals([]);
      setCurrentCalendarMonth(dayjs());
      setViewMode(true);
      setError(null);

      fetchAllRentals();
    }
  }, [open, property?.id]);

  const summaryStats = {
    totalBookings: rentals.length,
    totalRevenue: rentals.reduce((sum, rental) => sum + Number(rental.price), 0),
    activeBookings: rentals.filter((rental) => {
      const now = dayjs();
      const start = dayjs(rental.startDate);
      const end = dayjs(rental.endDate);
      return now.isBetween(start, end, null, '[]');
    }).length,
    upcomingBookings: rentals.filter((rental) => {
      return dayjs(rental.startDate).isAfter(dayjs());
    }).length,
  };

  const handleEditRental = (rental: Rental) => {
    setEditingRental(rental);
    setViewMode(false);

    const rentalType = rental.type || RENTAL_TYPE.DAILY;

    reset({
      startDate: null,
      endDate: null,
      numberOfMonths: 1,
      rentType: rentalType,
      name: rental.renter?.user?.name || '',
      email: rental.renter?.user?.email || '',
      phone: rental.renter?.user?.phone || '',
      nicNumber: rental.renter?.nicNumber || '',
      passport: rental.renter?.passport || '',
    });

    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleDeleteRental = (rental: Rental) => {
    openConfirmDialog(
      t('property:rental_management.delete_confirm_title'),
      t('property:rental_management.delete_confirm_message', {
        clientName: rental.renter?.user?.name || 'Unknown',
        dates: `${dayjs(rental.startDate).format('MMM DD')} - ${dayjs(rental.endDate).format(
          'MMM DD, YYYY'
        )}`,
      }),
      async () => {
        try {
          const response = await deleteOne(rental.id, {
            displayProgress: true,
            displaySuccess: true,
          });
          if (response.success) {
            setRentals((prev) => prev.filter((r) => r.id !== rental.id));
            setFilteredRentals((prev) => prev.filter((r) => r.id !== rental.id));

            // Clear editing state if the deleted rental was being edited
            if (editingRental && editingRental.id === rental.id) {
              setEditingRental(null);
              setViewMode(true);
            }
          }
        } catch (error) {
          console.error('Failed to delete rental:', error);
        }
      },
      t('property:rental_management.delete_confirm_yes'),
      'error'
    );
  };

  const handleBookingCreated = async (values: BookingFormValues) => {
    if (!user?.agent?.id || !selectedStartDate) {
      return;
    }

    let price = 0;
    let endDate = dayjs();

    if (values.rentType === RENTAL_TYPE.DAILY) {
      if (!selectedEndDate) {
        return;
      }
      const start = selectedStartDate;
      const end = selectedEndDate;
      const daysDiff = Math.max(1, end.diff(start, 'day'));
      price = property.dailyPrice * daysDiff;
      endDate = end;
    } else {
      const months = values.numberOfMonths;
      price = property.monthlyPrice * months;
      endDate = selectedStartDate.add(months, 'month');
    }

    const createData = {
      propertyId: property.id,
      agentId: user.agent.id,
      startDate: selectedStartDate.toISOString(),
      endDate: endDate.toISOString(),
      price,
      type: values.rentType,
      name: values.name,
      email: values.email,
      phone: values.phone,
      nicNumber: values.nicNumber,
      passport: values.passport,
    };

    const response = await createOne(createData, {
      displayProgress: true,
      displaySuccess: true,
    });

    if (response.success) {
      setViewMode(true);
      setEditingRental(null);
      fetchAllRentals();
    }
  };

  const handleBookingUpdated = async (values: BookingFormValues) => {
    if (!editingRental || !user?.agent?.id || !selectedStartDate) {
      return;
    }

    let price = 0;
    let endDate = dayjs();

    if (values.rentType === RENTAL_TYPE.DAILY) {
      if (!selectedEndDate) {
        return;
      }
      const start = selectedStartDate;
      const end = selectedEndDate;
      const daysDiff = Math.max(1, end.diff(start, 'day'));
      price = property.dailyPrice * daysDiff;
      endDate = end;
    } else {
      const months = values.numberOfMonths;
      price = property.monthlyPrice * months;
      endDate = selectedStartDate.add(months, 'month');
    }

    const updateData = {
      propertyId: property.id,
      agentId: user.agent.id,
      startDate: selectedStartDate.toISOString(),
      endDate: endDate.toISOString(),
      price,
      type: values.rentType,
      name: values.name,
      email: values.email,
      phone: values.phone,
      nicNumber: values.nicNumber,
      passport: values.passport,
    };

    const response = await updateOne(editingRental.id, updateData, {
      displayProgress: true,
      displaySuccess: true,
    });

    if (response.success) {
      setViewMode(true);
      setEditingRental(null);
      fetchAllRentals();
    }
  };

  const handleCreateNewBooking = () => {
    setEditingRental(null);
    setViewMode(false);

    reset({
      startDate: null,
      endDate: null,
      numberOfMonths: 1,
      rentType: RENTAL_TYPE.DAILY,
      name: '',
      email: '',
      phone: '',
      nicNumber: '',
      passport: '',
    });

    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleCancelEdit = () => {
    setViewMode(true);
    setEditingRental(null);

    reset({
      startDate: null,
      endDate: null,
      numberOfMonths: 1,
      rentType: RENTAL_TYPE.DAILY,
      name: '',
      email: '',
      phone: '',
      nicNumber: '',
      passport: '',
    });

    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const getStatusColor = (rental: Rental) => {
    const now = dayjs();
    const start = dayjs(rental.startDate);
    const end = dayjs(rental.endDate);

    if (now.isBefore(start)) {
      return 'primary';
    }
    if (now.isBetween(start, end, null, '[]')) {
      return 'success';
    }
    return 'default';
  };

  const getStatusLabel = (rental: Rental) => {
    const now = dayjs();
    const start = dayjs(rental.startDate);
    const end = dayjs(rental.endDate);

    if (now.isBefore(start)) {
      return t('property:rental_management.status.upcoming');
    }
    if (now.isBetween(start, end, null, '[]')) {
      return t('property:rental_management.status.active');
    }
    return t('property:rental_management.status.completed');
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 'md',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                <Home />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {t('property:rental_management.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.title?.fr ||
                    property.title?.en ||
                    property.title?.ar ||
                    property.title?.es ||
                    t('property:rental_management.untitled')}
                </Typography>
              </Box>
            </Box>
            <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }} color="inherit">
              <Close />
            </Button>
          </Box>

          <Box
            sx={{
              p: 3,
              pt: 0,
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '3px',
              },
            }}
          >
            <Stack spacing={3}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  color="text.secondary"
                  gutterBottom
                >
                  {t('property:rental_management.summary')}
                </Typography>
                <Stack direction="row" spacing={4} justifyContent="space-between" sx={{ mt: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {summaryStats.totalBookings}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('property:rental_management.total_bookings')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {property.currency} {summaryStats.totalRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('property:rental_management.total_revenue')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {summaryStats.activeBookings}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('property:rental_management.active_bookings')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                      {summaryStats.upcomingBookings}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('property:rental_management.upcoming_bookings')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('property:rental_management.bookings_list')}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreateNewBooking}
                    size="small"
                  >
                    {t('property:rental_management.create_booking')}
                  </Button>
                </Box>

                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {!loading && !error && rentals.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {t('property:rental_management.no_bookings')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {t('property:rental_management.no_bookings_description')}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleCreateNewBooking}
                    >
                      {t('property:rental_management.create_first_booking')}
                    </Button>
                  </Box>
                )}

                {!loading && !error && rentals.length > 0 && (
                  <Box>
                    <AvailabilityDatePicker
                      property={{
                        ...property,
                        rentals,
                      }}
                      startDate={viewMode ? null : selectedStartDate}
                      endDate={viewMode ? null : selectedEndDate}
                      onDateRangeSelect={viewMode ? () => {} : handleDateRangeSelect}
                      label={(() => {
                        if (viewMode) {
                          return t('property:rental_management.calendar_view');
                        }
                        if (editingRental) {
                          return t('property:rental_management.edit_booking');
                        }
                        return t('property:rental_management.create_booking');
                      })()}
                      rentType={viewMode ? RENTAL_TYPE.DAILY : watchRentType}
                      editingRental={editingRental || undefined}
                      viewMode={viewMode}
                      onMonthChange={handleCalendarMonthChange}
                    />

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {t('property:rental_management.rentals_for')}{' '}
                        {currentCalendarMonth.format('MMMM YYYY')}
                      </Typography>

                      {filteredRentals.length > 0 ? (
                        <Stack spacing={1}>
                          {filteredRentals.map((rental) => (
                            <RentalCard
                              key={rental.id}
                              rental={rental}
                              onEdit={handleEditRental}
                              onDelete={handleDeleteRental}
                              getStatusColor={getStatusColor}
                              getStatusLabel={getStatusLabel}
                              currency={property.currency}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('property:rental_management.no_bookings_this_month')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {!viewMode && (
                  <FormProvider {...methods}>
                    <Box
                      sx={{
                        mt: 3,
                        p: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        {editingRental
                          ? t('property:rental_management.edit_booking')
                          : t('property:rental_management.create_booking')}
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          {t('property:rental_management.rental_type')}
                        </Typography>
                        <RHFRadioGroup
                          name="rentType"
                          options={availableRentTypes}
                          row
                          sx={{ mt: 0 }}
                          onChange={(e) => handleRentTypeChange(e.target.value as RENTAL_TYPE)}
                        />
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            gutterBottom
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Person fontSize="small" />
                            {t('property:rental_management.client_information')}
                          </Typography>
                          <Stack spacing={2} sx={{ mt: 2 }}>
                            <RHFTextField
                              label={t('property:booking_calendar.full_name')}
                              name="name"
                              required
                              InputProps={{
                                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                              }}
                            />
                            <RHFTextField
                              label={t('property:booking_calendar.email_address')}
                              name="email"
                              type="email"
                              required
                              InputProps={{
                                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                              }}
                            />
                            <RHFTextField
                              label={t('property:booking_calendar.phone_number')}
                              name="phone"
                              required
                              InputProps={{
                                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                              }}
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            {t('property:rental_management.additional_information')}
                          </Typography>
                          <Stack spacing={2} sx={{ mt: 2 }}>
                            <RHFTextField
                              label={t('property:booking_calendar.nicNumber')}
                              name="nicNumber"
                              InputProps={{
                                startAdornment: (
                                  <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />
                                ),
                              }}
                            />
                            <RHFTextField
                              label={t('property:booking_calendar.passport')}
                              name="passport"
                              InputProps={{
                                startAdornment: (
                                  <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />
                                ),
                              }}
                            />
                            {watchRentType === RENTAL_TYPE.MONTHLY && (
                              <RHFTextField
                                name="numberOfMonths"
                                type="number"
                                label={t('property:booking_calendar.number_of_months')}
                                inputProps={{ min: 1, max: 12 }}
                                onChange={(e) => {
                                  const months = parseInt(e.target.value) || 1;
                                  setValue('numberOfMonths', months);
                                  handleNumberOfMonthsChange(months);
                                }}
                                sx={{ maxWidth: 200 }}
                              />
                            )}
                          </Stack>
                        </Grid>

                        <Grid item xs={12}>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              borderRadius: 1,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              {t('property:rental_management.booking_summary')}
                            </Typography>
                            <Stack spacing={1}>
                              {selectedStartDate && (
                                <Typography variant="body2">
                                  <strong>
                                    {watchRentType === RENTAL_TYPE.DAILY
                                      ? t('property:rental_management.check_in')
                                      : t('property:rental_management.start_date')}
                                  </strong>{' '}
                                  {selectedStartDate.format('dddd, MMMM D, YYYY')}
                                </Typography>
                              )}
                              {selectedEndDate && (
                                <Typography variant="body2">
                                  <strong>
                                    {watchRentType === RENTAL_TYPE.DAILY
                                      ? t('property:rental_management.check_out')
                                      : t('property:rental_management.end_date')}
                                  </strong>{' '}
                                  {selectedEndDate.format('dddd, MMMM D, YYYY')}
                                </Typography>
                              )}
                              {selectedStartDate && selectedEndDate && (
                                <Typography variant="body2">
                                  <strong>{t('property:rental_management.duration')}</strong>{' '}
                                  {watchRentType === RENTAL_TYPE.DAILY
                                    ? `${Math.max(
                                        1,
                                        selectedEndDate.diff(selectedStartDate, 'day')
                                      )} ${t('property:rental_management.days')}`
                                    : `${watchNumberOfMonths} ${
                                        watchNumberOfMonths === 1
                                          ? t('property:booking_calendar.months')
                                          : t('property:booking_calendar.months')
                                      }`}
                                </Typography>
                              )}
                              {selectedStartDate && selectedEndDate && (
                                <Typography variant="body2">
                                  <strong>{t('property:booking_calendar.total_price')}</strong>{' '}
                                  {property.currency}{' '}
                                  {watchRentType === RENTAL_TYPE.DAILY
                                    ? (
                                        property.dailyPrice *
                                        Math.max(1, selectedEndDate.diff(selectedStartDate, 'day'))
                                      ).toLocaleString()
                                    : (
                                        property.monthlyPrice * watchNumberOfMonths
                                      ).toLocaleString()}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button
                              variant="outlined"
                              onClick={handleCancelEdit}
                              color="inherit"
                              size="large"
                            >
                              {t('property:booking_calendar.cancel')}
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleSubmit(
                                editingRental ? handleBookingUpdated : handleBookingCreated
                              )}
                              disabled={
                                !selectedStartDate ||
                                (watchRentType === RENTAL_TYPE.DAILY && !selectedEndDate) ||
                                (watchRentType === RENTAL_TYPE.MONTHLY &&
                                  (!watchNumberOfMonths || watchNumberOfMonths < 1)) ||
                                isSubmitting
                              }
                              size="large"
                              sx={{ minWidth: 120 }}
                            >
                              {(() => {
                                if (isSubmitting) {
                                  return editingRental
                                    ? t('property:rental_management.updating')
                                    : t('property:booking_calendar.creating');
                                }
                                return editingRental
                                  ? t('property:rental_management.update_booking')
                                  : t('property:booking_calendar.create_booking');
                              })()}
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </FormProvider>
                )}
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button onClick={onClose} color="inherit" size="large">
              {t('common:close')}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PropertyRentalManagementModal;
