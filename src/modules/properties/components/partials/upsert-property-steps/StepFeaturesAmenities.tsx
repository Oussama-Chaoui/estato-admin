// StepFeaturesAmenities.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Box, Chip, CircularProgress, Grid, InputAdornment, Paper, Typography, useTheme } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { FormStepProps, FormStepRef } from '@common/components/lib/navigation/FormStepper';
import { Id } from '@common/defs/types';
import { RHFTextField, RHFAutocomplete, RHFCheckbox } from '@common/components/lib/react-hook-form';

import useAmenities from '@modules/amenities/hooks/api/useAmenities';
import { Amenity } from '@modules/amenities/defs/types';
import { getAmenityIcon } from '@modules/properties/defs/utils';
import { PROPERTY_TYPE } from '@modules/properties/defs/types';

export interface StepFeaturesAmenitiesData {
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  garages?: number | null;
  floors?: number | null;
  pool?: boolean;
  garden?: boolean;
  amenityIds: Id[];
}

type FieldFlags = Record<
  keyof Omit<StepFeaturesAmenitiesData, 'amenityIds' | 'pool' | 'garden'>,
  boolean
> & { pool: boolean; garden: boolean };

const FIELD_MATRIX: Record<PROPERTY_TYPE, FieldFlags> = {
  [PROPERTY_TYPE.HOUSE]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
    pool: true,
    garden: true,
  },
  [PROPERTY_TYPE.APARTMENT]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
    pool: true,
    garden: true,
  },
  [PROPERTY_TYPE.VILLA]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
    pool: true,
    garden: true,
  },
  [PROPERTY_TYPE.STUDIO]: {
    bedrooms: false,
    bathrooms: true,
    area: true,
    garages: false,
    floors: false,
    pool: false,
    garden: false,
  },
  [PROPERTY_TYPE.LAND]: {
    bedrooms: false,
    bathrooms: false,
    area: true,
    garages: false,
    floors: false,
    pool: false,
    garden: false,
  },
  [PROPERTY_TYPE.COMMERCIAL]: {
    bedrooms: false,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
    pool: false,
    garden: false,
  },
  [PROPERTY_TYPE.OFFICE]: {
    bedrooms: false,
    bathrooms: true,
    area: true,
    garages: false,
    floors: true,
    pool: false,
    garden: false,
  },
  [PROPERTY_TYPE.GARAGE]: {
    bedrooms: false,
    bathrooms: false,
    area: true,
    garages: true,
    floors: false,
    pool: false,
    garden: false,
  },
  [PROPERTY_TYPE.MANSION]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
    pool: true,
    garden: true,
  },
};

const buildSchema = (ptype: PROPERTY_TYPE) => {
  const flags = FIELD_MATRIX[ptype];
  return yup.object({
    bedrooms: flags.bedrooms
      ? yup
        .number()
        .typeError('Bedrooms must be a number')
        .required('Bedrooms is required')
        .min(0, 'Bedrooms cannot be negative')
      : yup.number().nullable(),
    bathrooms: flags.bathrooms
      ? yup
        .number()
        .typeError('Bathrooms must be a number')
        .required('Bathrooms is required')
        .min(0, 'Bathrooms cannot be negative')
      : yup.number().nullable(),
    area: flags.area
      ? yup
        .number()
        .typeError('Area must be a number')
        .required('Area is required')
        .min(0, 'Area must be at least 0')
      : yup.number().nullable(),
    garages: flags.garages
      ? yup
        .number()
        .typeError('Garages must be a number')
        .required('Garages is required')
        .min(0, 'Garages cannot be negative')
      : yup.number().nullable(),
    floors: flags.floors
      ? yup
        .number()
        .typeError('Floors must be a number')
        .required('Floors is required')
        .min(1, 'Floors must be at least 1')
      : yup.number().nullable(),
    pool: yup.boolean(),
    garden: yup.boolean(),
    amenityIds: yup.array().of(yup.number()).min(0, 'Invalid amenities selection'),
  });
};

const StepFeaturesAmenities = forwardRef<FormStepRef, FormStepProps>(({ data, next }, ref) => {
  const propertyType: PROPERTY_TYPE = (data?.type as PROPERTY_TYPE) ?? PROPERTY_TYPE.HOUSE;
  const flags = FIELD_MATRIX[propertyType];

  const { items: amenities } = useAmenities({
    fetchItems: true,
    pageSize: 'all',
  });
  const [loadingAmenities, setLoadingAmenities] = useState(!amenities);
  const theme = useTheme();

  useEffect(() => {
    if (amenities) {
      setLoadingAmenities(false);
    }
  }, [amenities]);

  const sortedAmenities = useMemo(() => {
    if (!amenities) {
      return [];
    }
    return [...amenities].sort((a, b) => a.name.localeCompare(b.name));
  }, [amenities]);

  const amenityOptions = sortedAmenities.map((a: Amenity) => a.id);
  const getAmenityLabel = (id: number) => amenities?.find((a) => a.id === id)?.name ?? '';

  const schema = useMemo(() => buildSchema(propertyType), [propertyType]);

  console.log(data)

  const methods = useForm<StepFeaturesAmenitiesData>({
    resolver: yupResolver(schema),
    defaultValues: {
      bedrooms: data?.features?.bedrooms ?? null,
      bathrooms: data?.features?.bathrooms ?? null,
      area: data?.features?.area ?? null,
      garages: data?.features?.garages ?? null,
      floors: data?.features?.floors ?? null,
      pool: data?.features?.pool ?? false,
      garden: data?.features?.garden ?? false,
      amenityIds: data?.amenityIds ?? [],
    },
  });

  useEffect(() => {
    methods.reset(methods.getValues(), { keepValues: true });
  }, [schema]);

  useImperativeHandle(ref, () => ({
    async submit() {
      await methods.handleSubmit((formData) => next(formData))();
    },
  }));

  if (loadingAmenities) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{
          p: 6,
          backgroundColor: theme.palette.background.paper,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          gap: 2
        }}>
          <CircularProgress
            size={50}
            thickness={4}
            sx={{ color: theme.palette.primary.main }}
          />
          <Typography variant="h6" color="text.secondary">
            Loading Amenities...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we load available amenities
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>


              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'text.primary',
                  pb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                Property Features
                <Chip
                  label={propertyType.replace('_', ' ')}
                  size="small"
                  sx={{
                    bgcolor: 'primary.lighter',
                    color: 'primary.dark',
                    textTransform: 'capitalize',
                    fontWeight: 500,
                  }}
                />
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {flags.bedrooms && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="bedrooms"
                      label="Bedrooms"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {getAmenityIcon('bed', {
                              color: 'primary',
                            })}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                {flags.bathrooms && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="bathrooms"
                      label="Bathrooms"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {getAmenityIcon('bathtub', {
                              color: 'primary',
                            })}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                {flags.area && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="area"
                      label="Area (m²)"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {getAmenityIcon('square-foot', {
                              color: 'primary',
                            })}
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}
                {flags.garages && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="garages"
                      label="Garages"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {getAmenityIcon('garage', {
                              color: 'primary',
                            })}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                {flags.floors && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="floors"
                      label="Floors"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {getAmenityIcon('stairs', {
                              color: 'primary',
                            })}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
                <Grid
                  item
                  xs={12}
                  lg={4}
                  container
                  spacing={2}
                  sx={{ mt: 0.5 }}
                  display="flex"
                  justifyContent="space-evenly"
                  alignItems="center"
                >
                  {flags.pool && (
                    <RHFCheckbox
                      name="pool"
                      label="Pool"
                      sx={{
                        '& .Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiFormControlLabel-label': {
                          color: 'text.secondary',
                          fontWeight: 500,
                        },
                      }}
                    />
                  )}
                  {flags.garden && (
                    <RHFCheckbox
                      name="garden"
                      label="Garden"
                      sx={{
                        '& .Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiFormControlLabel-label': {
                          color: 'text.secondary',
                          fontWeight: 500,
                        },
                      }}
                    />
                  )}
                </Grid>
              </Grid>


            </Grid>

            <Grid item xs={12}>

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'text.primary',
                  pb: 1,
                }}
              >
                Amenities
              </Typography>
              <RHFAutocomplete
                name="amenityIds"
                label="Select Amenities"
                multiple
                options={amenityOptions}
                fullWidth
                getOptionLabel={(option) =>
                  typeof option === 'number' ? getAmenityLabel(option) : ''
                }
                renderOption={(props, option) => {
                  const amenity = amenities?.find((a) => a.id === option);
                  return (
                    <li {...props} style={{ padding: '8px 16px' }}>
                      {amenity &&
                        getAmenityIcon(amenity.icon, {
                          color: 'primary',
                        })}
                      <Typography sx={{ ml: 1.5 }}>{amenity?.name}</Typography>
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      label={getAmenityLabel(option)}
                      size="small"
                      sx={{
                        m: 0.5,
                        bgcolor: 'primary.lighter',
                        '& .MuiChip-deleteIcon': {
                          color: 'primary.dark',
                        },
                      }}
                    />
                  ))
                }
                sx={{
                  '& .MuiAutocomplete-inputRoot': { p: 0.75 },
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </FormProvider >
  );
});

export default StepFeaturesAmenities;
