import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  Divider,
  Paper,
  Avatar,
  useTheme,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import RHFRadioGroup from '@common/components/lib/react-hook-form/RHFRadioGroup';
import AvailabilityDatePicker from './AvailabilityDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { Property, Rental, RENTAL_TYPE } from '@modules/properties/defs/types';
import { Person, Phone, CreditCard, Home, Close, Info, Email } from '@mui/icons-material';

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
  onSubmit: (values: BookingFormValues) => Promise<void> | void;
  editingRental?: Rental | null;
}

const BookingModal = ({ open, onClose, property, onSubmit, editingRental }: Props) => {
  const theme = useTheme();
  const { user } = useAuth();

  const availableRentTypes: Array<{ label: string; value: RENTAL_TYPE }> = [];
  if (property.dailyPriceEnabled) {
    availableRentTypes.push({ label: 'Daily Rent', value: RENTAL_TYPE.DAILY });
  }
  if (property.monthlyPriceEnabled) {
    availableRentTypes.push({ label: 'Monthly Rent', value: RENTAL_TYPE.MONTHLY });
  }

  const createValidationSchema = (rentType: RENTAL_TYPE) => {
    const baseSchema = yup
      .object()
      .shape({
        name: yup.string().required('Full name is required'),
        email: yup.string().email('Invalid email format').required('Email is required'),
        phone: yup.string().required('Phone number is required'),
        nicNumber: yup.string().optional(),
        passport: yup.string().optional(),
        numberOfMonths: yup.number().when('rentType', {
          is: 'monthly',
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
      });

    if (rentType === RENTAL_TYPE.DAILY) {
      return baseSchema.shape({
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
              return dayjs(value as Dayjs).isAfter(dayjs(startDate as Dayjs), 'day');
            },
          }),
      });
    }
    return baseSchema.shape({
      startDate: yup.mixed().required('Start date is required'),
      numberOfMonths: yup
        .number()
        .required('Number of months is required')
        .min(1, 'Minimum 1 month')
        .max(12, 'Maximum 12 months'),
    });
  };

  // Determine rent type from editing rental
  const getRentTypeFromRental = (rental: Rental | null | undefined): RENTAL_TYPE => {
    if (!rental) {
      return (availableRentTypes[0]?.value as RENTAL_TYPE) || RENTAL_TYPE.DAILY;
    }

    // Use the rental's type if available, otherwise determine from duration
    if (rental.type) {
      return rental.type;
    }

    const start = dayjs(rental.startDate);
    const end = dayjs(rental.endDate);
    const daysDiff = end.diff(start, 'day');

    // If it's more than 30 days, assume monthly, otherwise daily
    return daysDiff > 30 ? RENTAL_TYPE.MONTHLY : RENTAL_TYPE.DAILY;
  };

  const methods = useForm<BookingFormValues>({
    defaultValues: {
      startDate: editingRental ? dayjs(editingRental.startDate) : null,
      endDate: editingRental ? dayjs(editingRental.endDate) : null,
      numberOfMonths:
        editingRental && getRentTypeFromRental(editingRental) === RENTAL_TYPE.MONTHLY
          ? Math.ceil(
              dayjs(editingRental.endDate).diff(dayjs(editingRental.startDate), 'month', true)
            )
          : 1,
      rentType: getRentTypeFromRental(editingRental),
      name: editingRental?.renter?.user?.name || '',
      email: editingRental?.renter?.user?.email || '',
      phone: editingRental?.renter?.user?.phone || '',
      nicNumber: editingRental?.renter?.nicNumber || '',
      passport: editingRental?.renter?.passport || '',
    },
    mode: 'onChange',
    resolver: yupResolver(createValidationSchema(getRentTypeFromRental(editingRental))),
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

  const handleRentTypeChange = (newRentType: RENTAL_TYPE) => {
    setValue('rentType', newRentType);
    methods.clearErrors();
    trigger();
  };

  const handleNumberOfMonthsChange = (months: number) => {
    if (watchStartDate && watchRentType === RENTAL_TYPE.MONTHLY) {
      const newEndDate = dayjs(watchStartDate).add(months, 'month');
      setValue('endDate', newEndDate);
    }
  };

  const calculatePrice = () => {
    if (watchRentType === RENTAL_TYPE.DAILY) {
      if (!watchStartDate || !watchEndDate) {
        return 0;
      }

      const start = dayjs(watchStartDate);
      const end = dayjs(watchEndDate);
      // Count actual days of stay (e.g., today to tomorrow = 1 day)
      const daysDiff = Math.max(1, end.diff(start, 'day'));

      return property.dailyPrice * daysDiff;
    }
    return property.monthlyPrice * watchNumberOfMonths;
  };

  const totalPrice = calculatePrice();

  const submitHandler = handleSubmit(async (values: BookingFormValues) => {
    await onSubmit(values);
    onClose();
  });

  if (!user?.agent?.id) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Agent Access Required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Only agents can create bookings. Please log in with an agent account.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          pb: 1,
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
              {editingRental ? 'Edit Booking' : 'Book Property'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {property.title?.fr ||
                property.title?.en ||
                property.title?.ar ||
                property.title?.es ||
                'Untitled'}
            </Typography>
          </Box>
        </Box>
        <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }} color="inherit">
          <Close />
        </Button>
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent sx={{ p: 3, mt: 2, mb: 2 }}>
          <Stack spacing={3}>
            {/* Rent Type Selection */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Rent Type
              </Typography>
              <RHFRadioGroup
                name="rentType"
                options={availableRentTypes}
                row
                sx={{ mt: 0 }}
                onChange={(e) => handleRentTypeChange(e.target.value as RENTAL_TYPE)}
              />
            </Box>

            {/* Date Selection */}
            <AvailabilityDatePicker
              property={property}
              startDate={watchStartDate}
              endDate={watchEndDate}
              onDateRangeSelect={(startDate, endDate) => {
                setValue('startDate', startDate);
                if (endDate) {
                  setValue('endDate', endDate);
                } else if (
                  startDate &&
                  watchRentType === RENTAL_TYPE.MONTHLY &&
                  watchNumberOfMonths
                ) {
                  const newEndDate = dayjs(startDate).add(watchNumberOfMonths, 'month');
                  setValue('endDate', newEndDate);
                } else {
                  setValue('endDate', null);
                }
              }}
              minDate={dayjs()}
              label={
                watchRentType === RENTAL_TYPE.DAILY
                  ? 'Select Check-in and Check-out Dates'
                  : 'Select Start Date'
              }
              rentType={watchRentType}
              editingRental={editingRental}
            />

            {/* Number of Months for Monthly Rent */}
            {watchRentType === RENTAL_TYPE.MONTHLY && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Number of Months
                </Typography>
                <RHFTextField
                  name="numberOfMonths"
                  type="number"
                  label="Months"
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

            {/* Monthly Rent Info Note */}
            {watchRentType === RENTAL_TYPE.MONTHLY && (
              <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText' }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Info fontSize="small" sx={{ mt: 0.2 }} />
                  <Typography variant="body2">
                    <strong>Note:</strong> The number of months is used for price calculation only.
                    The actual rental duration can be adjusted later. This is just an estimate.
                  </Typography>
                </Stack>
              </Paper>
            )}

            {/* Price Calculation */}
            {totalPrice > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Total Price
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {watchRentType === RENTAL_TYPE.DAILY ? 'Daily Rate' : 'Monthly Rate'}:{' '}
                      {property.currency}{' '}
                      {watchRentType === RENTAL_TYPE.DAILY
                        ? property.dailyPrice
                        : property.monthlyPrice}
                      {watchRentType === RENTAL_TYPE.MONTHLY && ` × ${watchNumberOfMonths} months`}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {property.currency} {totalPrice.toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            )}

            <Divider />

            {/* Renter Information */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Person fontSize="small" />
                Renter Information
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <RHFTextField
                  label="Full Name"
                  name="name"
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <RHFTextField
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <RHFTextField
                  label="Phone Number"
                  name="phone"
                  required
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Stack direction="row" spacing={2}>
                  <RHFTextField
                    label="NIC Number"
                    name="nicNumber"
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <RHFTextField
                    label="Passport"
                    name="passport"
                    sx={{ flex: 1 }}
                    InputProps={{
                      startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={onClose} color="inherit" size="large">
            Cancel
          </Button>
          <Button
            onClick={submitHandler}
            variant="contained"
            disabled={isSubmitting}
            size="large"
            sx={{ minWidth: 120 }}
          >
            {(() => {
              if (isSubmitting) {
                return editingRental ? 'Updating...' : 'Creating...';
              }
              return editingRental ? 'Update Booking' : 'Create Booking';
            })()}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default BookingModal;
