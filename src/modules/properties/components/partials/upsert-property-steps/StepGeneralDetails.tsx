import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, MenuItem, Grid, Paper, Typography, useTheme } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { FormStepProps, FormStepRef } from '@common/components/lib/navigation/FormStepper';
import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import RHFSwitch from '@common/components/lib/react-hook-form/RHFSwitch';
import { RHFSelect } from '@common/components/lib/react-hook-form/RHFSelect';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PROPERTY_STATUS, PROPERTY_TYPE } from '@modules/properties/defs/types';

const ALLOWED_PROPERTY_STATUS = [PROPERTY_STATUS.FOR_SALE, PROPERTY_STATUS.FOR_RENT];

export interface StepGeneralDetailsData {
  title: string;
  description: string;
  streetAddress: string;
  monthlyPrice: number;
  dailyPrice: number;
  salePrice: number;
  currency: string;
  yearBuilt: number;
  lotSize: number;
  type: PROPERTY_TYPE;
  status: PROPERTY_STATUS;
  dailyPriceEnabled: boolean;
  monthlyPriceEnabled: boolean;
}

const schema = yup.object().shape({
  title: yup
    .string()
    .max(255, 'Title must be at most 255 characters')
    .required('Title is required'),
  description: yup.string().required('Description is required'),
  streetAddress: yup.string().required('Street address is required'),
  monthlyPrice: yup
    .number()
    .min(0, 'Monthly price must be at least 0')
    .required('Monthly price is required'),
  dailyPrice: yup
    .number()
    .min(0, 'Daily price must be at least 0')
    .required('Daily price is required'),
  salePrice: yup
    .number()
    .min(0, 'Sale price must be at least 0')
    .required('Sale price is required'),
  currency: yup.string().required('Currency is required'),
  yearBuilt: yup
    .number()
    .integer('Year built must be an integer')
    .required('Year built is required'),
  lotSize: yup
    .number()
    .integer('Lot size must be an integer')
    .min(0, 'Lot size must be at least 0')
    .required('Lot size is required'),
  type: yup
    .string()
    .oneOf(Object.values(PROPERTY_TYPE), 'Invalid property type')
    .required('Property type is required'),
  status: yup
    .string()
    .oneOf(ALLOWED_PROPERTY_STATUS, 'Invalid status')
    .required('Status is required'),
  dailyPriceEnabled: yup.boolean(),
  monthlyPriceEnabled: yup.boolean(),
});

const StepGeneralDetails = forwardRef<FormStepRef, FormStepProps>((props, ref) => {
  const { data, next } = props;
  const theme = useTheme();

  const methods = useForm<StepGeneralDetailsData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      streetAddress: data?.streetAddress || '',
      monthlyPrice: data?.monthlyPrice || 0,
      dailyPrice: data?.dailyPrice || 0,
      salePrice: data?.salePrice || 0,
      currency: data?.currency || 'MAD',
      yearBuilt: data?.yearBuilt || 0,
      lotSize: data?.lotSize || 0,
      type: data?.type || ('' as PROPERTY_TYPE),
      // if initial type is LAND, default status to FOR_SALE
      status:
        data?.status ??
        (data?.type === PROPERTY_TYPE.LAND ? PROPERTY_STATUS.FOR_SALE : ('' as PROPERTY_STATUS)),
      dailyPriceEnabled: data?.dailyPriceEnabled || false,
      monthlyPriceEnabled: data?.monthlyPriceEnabled || false,
    },
  });

  // watch the selected type
  const selectedType = methods.watch('type');
  // when type switches to LAND, force status = FOR_SALE
  useEffect(() => {
    if (selectedType === PROPERTY_TYPE.LAND) {
      methods.setValue('status', PROPERTY_STATUS.FOR_SALE);
    }
  }, [selectedType, methods]);

  useImperativeHandle(ref, () => ({
    async submit() {
      await methods.handleSubmit((formData) => next(formData))();
    },
  }));

  useEffect(() => {
    methods.reset(
      {
        title: data?.title || '',
        description: data?.description || '',
        streetAddress: data?.streetAddress || '',
        monthlyPrice: data?.monthlyPrice || 0,
        dailyPrice: data?.dailyPrice || 0,
        salePrice: data?.salePrice || 0,
        currency: data?.currency || 'MAD',
        yearBuilt: data?.yearBuilt || 0,
        lotSize: data?.lotSize || 0,
        type: data?.type || ('' as PROPERTY_TYPE),
        status:
          data?.status ??
          (data?.type === PROPERTY_TYPE.LAND ? PROPERTY_STATUS.FOR_SALE : ('' as PROPERTY_STATUS)),
        dailyPriceEnabled: data?.dailyPriceEnabled || false,
        monthlyPriceEnabled: data?.monthlyPriceEnabled || false,
      },
      { keepDefaultValues: true }
    );
  }, [data, methods]);

  const dailyEnabled = methods.watch('dailyPriceEnabled', false);
  const monthlyEnabled = methods.watch('monthlyPriceEnabled', false);

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="title"
                    label="Title"
                    InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFSelect name="type" label="Property Type" fullWidth>
                    {Object.values(PROPERTY_TYPE).map((typeValue) => (
                      <MenuItem key={typeValue} value={typeValue}>
                        {typeValue.charAt(0).toUpperCase() + typeValue.slice(1)}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="description" label="Description" multiline rows={3} />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="streetAddress" label="Street Address" fullWidth />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Pricing Details Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                Pricing Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <RHFSwitch
                    name="dailyPriceEnabled"
                    label="Enable Daily Price"
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <RHFTextField
                    name="dailyPrice"
                    label="Daily Price"
                    type="number"
                    disabled={!dailyEnabled}
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ mr: 1, color: theme.palette.text.secondary }}>
                          MAD
                        </Typography>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <RHFSwitch
                    name="monthlyPriceEnabled"
                    label="Enable Monthly Price"
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <RHFTextField
                    name="monthlyPrice"
                    label="Monthly Price"
                    type="number"
                    disabled={!monthlyEnabled}
                    InputProps={{
                      endAdornment: (
                        <Typography sx={{ mr: 1, color: theme.palette.text.secondary }}>
                          MAD
                        </Typography>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box sx={{ height: theme.spacing(4.6) }} />
                    <RHFTextField
                      name="salePrice"
                      label="Sale Price"
                      type="number"
                      InputProps={{
                        endAdornment: (
                          <Typography sx={{ mr: 1, color: theme.palette.text.secondary }}>
                            MAD
                          </Typography>
                        ),
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Property Details Section — hidden for LAND */}
          {selectedType !== PROPERTY_TYPE.LAND && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                  Property Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <RHFTextField
                      name="yearBuilt"
                      label="Year Built"
                      type="number"
                      InputProps={{ inputProps: { min: 1800, max: new Date().getFullYear() } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <RHFTextField name="lotSize" label="Lot Size (m²)" type="number" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <RHFSelect name="status" label="Property Status" fullWidth>
                      {ALLOWED_PROPERTY_STATUS.map((statusValue) => (
                        <MenuItem key={statusValue} value={statusValue}>
                          {statusValue.charAt(0).toUpperCase() +
                            statusValue.slice(1).replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </FormProvider>
  );
});

export default StepGeneralDetails;
