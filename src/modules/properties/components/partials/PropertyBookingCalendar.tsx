import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  Collapse,
  useTheme,
} from '@mui/material';
import { Person, Phone, CreditCard, Home, Info, Email } from '@mui/icons-material';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import RHFRadioGroup from '@common/components/lib/react-hook-form/RHFRadioGroup';
import AvailabilityDatePicker from './AvailabilityDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import useAuth from '@modules/auth/hooks/api/useAuth';
import useRentals from '@modules/rentals/hooks/api/useRentals';
import { Property, RENTAL_TYPE } from '@modules/properties/defs/types';
import { useTranslation } from 'react-i18next';

export interface BookingFormValues {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  numberOfMonths: number;
  rentType: 'daily' | 'monthly';
  name: string;
  email: string;
  phone: string;
  nicNumber?: string;
  passport?: string;
}

interface PropertyBookingCalendarProps {
  property: Property;
  onBookingCreated?: () => void;
}

const PropertyBookingCalendar: React.FC<PropertyBookingCalendarProps> = ({
  property,
  onBookingCreated,
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['property', 'common']);
  const { user } = useAuth();
  const { createOne } = useRentals();

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Set dayjs locale based on current language
  dayjs.locale(i18n.language);

  // Available rent types based on property - EXACT COPY from modal
  const availableRentTypes = [];
  if (property.dailyPriceEnabled) {
    availableRentTypes.push({ label: t('property:booking_calendar.daily_rent'), value: 'daily' });
  }
  if (property.monthlyPriceEnabled) {
    availableRentTypes.push({
      label: t('property:booking_calendar.monthly_rent'),
      value: 'monthly',
    });
  }

  // Create validation schema - EXACT COPY from modal
  const createValidationSchema = (rentType: 'daily' | 'monthly') => {
    const baseSchema = yup
      .object()
      .shape({
        name: yup.string().required(t('property:booking_calendar.validation.full_name_required')),
        email: yup
          .string()
          .email(t('property:booking_calendar.validation.email_invalid'))
          .required(t('property:booking_calendar.validation.email_required')),
        phone: yup.string().required(t('property:booking_calendar.validation.phone_required')),
        nicNumber: yup.string().optional(),
        passport: yup.string().optional(),
        numberOfMonths: yup.number().when('rentType', {
          is: 'monthly',
          then: (schema) =>
            schema
              .required(t('property:booking_calendar.validation.number_of_months_required'))
              .min(1, t('property:booking_calendar.validation.minimum_1_month'))
              .max(12, t('property:booking_calendar.validation.maximum_12_months')),
          otherwise: (schema) => schema.optional(),
        }),
      })
      .test({
        name: 'nic-or-passport',
        message: t('property:booking_calendar.either_nic_passport'),
        test(_value, context) {
          const { nicNumber, passport } = context.parent;
          const hasNic = nicNumber && nicNumber.trim() !== '';
          const hasPassport = passport && passport.trim() !== '';

          if (!hasNic && !hasPassport) {
            return context.createError({
              message: t('property:booking_calendar.either_nic_passport'),
              path: 'nicNumber',
            });
          }
          return true;
        },
      });

    if (rentType === 'daily') {
      return baseSchema.shape({
        startDate: yup
          .mixed()
          .required(t('property:booking_calendar.validation.start_date_required')),
        endDate: yup
          .mixed()
          .required(t('property:booking_calendar.validation.end_date_required'))
          .test({
            name: 'end-date-after-start',
            message: t('property:booking_calendar.validation.end_date_after_start'),
            test(value, context) {
              const { startDate } = context.parent;
              if (!startDate || !value) {
                return true;
              }
              return dayjs(value as Dayjs).isAfter(dayjs(startDate as Dayjs), 'day');
            },
          }),
      });
    }
    return baseSchema.shape({
      startDate: yup
        .mixed()
        .required(t('property:booking_calendar.validation.start_date_required')),
      numberOfMonths: yup
        .number()
        .required(t('property:booking_calendar.validation.number_of_months_required'))
        .min(1, t('property:booking_calendar.validation.minimum_1_month'))
        .max(12, t('property:booking_calendar.validation.maximum_12_months')),
    });
  };

  const methods = useForm<BookingFormValues>({
    defaultValues: {
      startDate: null,
      endDate: null,
      numberOfMonths: 1,
      rentType: (availableRentTypes[0]?.value as 'daily' | 'monthly') || 'daily',
      name: '',
      email: '',
      phone: '',
      nicNumber: '',
      passport: '',
    },
    mode: 'onChange',
    resolver: yupResolver(
      createValidationSchema((availableRentTypes[0]?.value as 'daily' | 'monthly') || 'daily')
    ),
  });

  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { isSubmitting },
  } = methods;

  const watchRentType = watch('rentType');
  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');
  const watchNumberOfMonths = watch('numberOfMonths');

  const handleRentTypeChange = (newRentType: 'daily' | 'monthly') => {
    setValue('rentType', newRentType);
    methods.clearErrors();
    trigger();
  };

  const handleNumberOfMonthsChange = (months: number) => {
    if (watchStartDate && watchRentType === 'monthly') {
      const newEndDate = dayjs(watchStartDate).add(months, 'month');
      setValue('endDate', newEndDate);
    }
  };

  // EXACT COPY from modal - calculatePrice
  const calculatePrice = () => {
    if (watchRentType === 'daily') {
      if (!watchStartDate || !watchEndDate) {
        return 0;
      }

      const start = dayjs(watchStartDate);
      const end = dayjs(watchEndDate);
      const daysDiff = end.diff(start, 'day');

      return property.dailyPrice * daysDiff;
    }
    return property.monthlyPrice * watchNumberOfMonths;
  };

  const totalPrice = calculatePrice();

  // EXACT COPY from modal - submitHandler with booking creation
  const submitHandler = handleSubmit(async (values: BookingFormValues) => {
    try {
      if (!property?.id || !user?.agent?.id || !values.startDate || !values.endDate) {
        throw new Error(t('property:booking_calendar.missing_booking_info'));
      }

      await createOne({
        propertyId: property.id,
        clientId: user.id,
        agentId: user.agent.id,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        price: totalPrice,
        type: watchRentType === 'daily' ? RENTAL_TYPE.DAILY : RENTAL_TYPE.MONTHLY,
        name: values.name,
        email: values.email,
        phone: values.phone,
        nicNumber: values.nicNumber || '',
        passport: values.passport || '',
      });

      setSnackbar({
        open: true,
        message: t('property:booking_calendar.booking_created'),
        severity: 'success',
      });

      // Reset form
      methods.reset();
      setShowBookingForm(false);

      // Call callback if provided
      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('property:booking_calendar.booking_error'),
        severity: 'error',
      });
    }
  });

  // Agent access check - EXACT COPY from modal
  if (!user?.agent?.id) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: theme.shadows[1],
        }}
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('property:booking_calendar.agent_access_required')}
          </Typography>
          <Typography variant="body2">
            {t('property:booking_calendar.agent_access_message')}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: theme.shadows[1],
      }}
    >
      {/* Header - EXACT COPY from modal DialogTitle */}
      <Box
        sx={{
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <Home />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {t('property:booking_calendar.create_booking')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property?.title?.fr ||
                property?.title?.en ||
                property?.title?.ar ||
                property?.title?.es ||
                t('property:booking_calendar.untitled')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Calendar Section */}
      <Box sx={{ mb: 3 }}>
        <AvailabilityDatePicker
          property={property}
          startDate={watchStartDate}
          endDate={watchEndDate}
          onDateRangeSelect={(startDate, endDate) => {
            setValue('startDate', startDate);
            if (endDate) {
              setValue('endDate', endDate);
            } else if (startDate && watchRentType === 'monthly' && watchNumberOfMonths) {
              const newEndDate = dayjs(startDate).add(watchNumberOfMonths, 'month');
              setValue('endDate', newEndDate);
            } else {
              setValue('endDate', null);
            }

            // Show booking form when dates are selected
            if (startDate) {
              setShowBookingForm(true);
            }
          }}
          minDate={dayjs()}
          label={
            watchRentType === 'daily'
              ? t('property:booking_calendar.select_checkin_checkout')
              : t('property:booking_calendar.select_start_date')
          }
          rentType={watchRentType === 'daily' ? RENTAL_TYPE.DAILY : RENTAL_TYPE.MONTHLY}
        />
      </Box>

      {/* Booking Form Section - EXACT COPY from modal DialogContent */}
      <Collapse in={showBookingForm}>
        <FormProvider {...methods}>
          <Stack spacing={3}>
            {/* Rent Type Selection - EXACT COPY from modal */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {t('property:booking_calendar.rent_type')}
              </Typography>
              <RHFRadioGroup
                name="rentType"
                options={availableRentTypes}
                row
                sx={{ mt: 0 }}
                onChange={(e) => handleRentTypeChange(e.target.value as 'daily' | 'monthly')}
              />
            </Box>

            {/* Number of Months for Monthly Rent - EXACT COPY from modal */}
            {watchRentType === 'monthly' && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('property:booking_calendar.number_of_months')}
                </Typography>
                <RHFTextField
                  name="numberOfMonths"
                  type="number"
                  label={t('property:booking_calendar.months')}
                  inputProps={{ min: 1, max: 12 }}
                  onChange={(e) => {
                    const months = parseInt(e.target.value) || 1;
                    setValue('numberOfMonths', months);
                    handleNumberOfMonthsChange(months);
                  }}
                  sx={{ maxWidth: 200 }}
                />
              </Box>
            )}

            {/* Monthly Rent Info Note - EXACT COPY from modal */}
            {watchRentType === 'monthly' && (
              <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText' }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Info fontSize="small" sx={{ mt: 0.2 }} />
                  <Typography variant="body2">
                    <strong>{t('property:booking_calendar.note_prefix')}</strong>{' '}
                    {t('property:booking_calendar.booking_note')}
                  </Typography>
                </Stack>
              </Paper>
            )}

            {/* Price Calculation - EXACT COPY from modal */}
            {totalPrice > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t('property:booking_calendar.total_price')}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {watchRentType === 'daily'
                        ? t('property:booking_calendar.daily_rate')
                        : t('property:booking_calendar.monthly_rate')}
                      : {property.currency || t('property:booking_calendar.default_currency')}{' '}
                      {watchRentType === 'daily' ? property.dailyPrice : property.monthlyPrice}
                      {watchRentType === 'monthly' &&
                        ` × ${watchNumberOfMonths} ${t('property:booking_calendar.months_suffix')}`}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {property.currency || t('property:booking_calendar.default_currency')}{' '}
                    {totalPrice.toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            )}

            <Divider />

            {/* Renter Information - EXACT COPY from modal */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Person fontSize="small" />
                {t('property:booking_calendar.renter_information')}
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
                <Stack direction="row" spacing={2}>
                  <RHFTextField
                    label={t('property:booking_calendar.nicNumber')}
                    name="nicNumber"
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <RHFTextField
                    label={t('property:booking_calendar.passport')}
                    name="passport"
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Action Buttons - EXACT COPY from modal DialogActions */}
            <Stack direction="row" spacing={2} sx={{ pt: 2 }} justifyContent="flex-end">
              <Button
                onClick={() => {
                  methods.reset();
                  setShowBookingForm(false);
                }}
                color="inherit"
                size="large"
              >
                {t('property:booking_calendar.cancel')}
              </Button>
              <Button
                onClick={submitHandler}
                variant="contained"
                disabled={isSubmitting}
                size="large"
                sx={{ minWidth: 120 }}
              >
                {isSubmitting
                  ? t('property:booking_calendar.creating')
                  : t('property:booking_calendar.create_booking_button')}
              </Button>
            </Stack>
          </Stack>
        </FormProvider>
      </Collapse>

      {/* Snackbar for notifications - EXACT COPY from modal */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default PropertyBookingCalendar;
