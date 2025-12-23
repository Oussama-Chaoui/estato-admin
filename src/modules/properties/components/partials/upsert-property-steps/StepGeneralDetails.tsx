import React, { forwardRef, useImperativeHandle, useEffect, useMemo, useState } from 'react';
import {
  Box,
  MenuItem,
  Grid,
  Paper,
  Typography,
  useTheme,
  Chip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getTranslatedAmenityName } from '../../../../../common/utils/amenities';
import { FormStepProps, FormStepRef } from '@common/components/lib/navigation/FormStepper';
import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import RHFSwitch from '@common/components/lib/react-hook-form/RHFSwitch';
import { RHFSelect, RHFAutocomplete } from '@common/components/lib/react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PROPERTY_TYPE, FURNISHING_STATUS } from '@modules/properties/defs/types';
import { Id } from '@common/defs/types';
import useAmenities from '@modules/amenities/hooks/api/useAmenities';
import { getAmenityIcon } from '@modules/properties/defs/utils';

export interface StepGeneralDetailsData {
  title: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  description: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  monthlyPrice: number;
  dailyPrice: number;
  salePrice: number;
  currency: string;
  yearBuilt: number;
  type: PROPERTY_TYPE;
  dailyPriceEnabled: boolean;
  monthlyPriceEnabled: boolean;
  hasVR: boolean;
  featured?: boolean;
  furnishingStatus: FURNISHING_STATUS;
  features: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    area?: number | null;
    garages?: number | null;
    floors?: number | null;
  };
  amenityIds: Id[];
}

type FeatureField = 'bedrooms' | 'bathrooms' | 'area' | 'garages' | 'floors';

type FeatureFlags = Record<FeatureField, boolean>;

const FIELD_MATRIX: Record<PROPERTY_TYPE, FeatureFlags> = {
  [PROPERTY_TYPE.HOUSE]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
  },
  [PROPERTY_TYPE.APARTMENT]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
  },
  [PROPERTY_TYPE.VILLA]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
  },
  [PROPERTY_TYPE.STUDIO]: {
    bedrooms: false,
    bathrooms: true,
    area: true,
    garages: false,
    floors: false,
  },
  [PROPERTY_TYPE.LAND]: {
    bedrooms: false,
    bathrooms: false,
    area: true,
    garages: false,
    floors: false,
  },
  [PROPERTY_TYPE.COMMERCIAL]: {
    bedrooms: false,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
  },
  [PROPERTY_TYPE.OFFICE]: {
    bedrooms: false,
    bathrooms: true,
    area: true,
    garages: false,
    floors: true,
  },
  [PROPERTY_TYPE.GARAGE]: {
    bedrooms: false,
    bathrooms: false,
    area: true,
    garages: true,
    floors: false,
  },
  [PROPERTY_TYPE.MANSION]: {
    bedrooms: true,
    bathrooms: true,
    area: true,
    garages: true,
    floors: true,
  },
};

const buildSchema = (ptype: PROPERTY_TYPE, t: (key: string) => string) => {
  const featureFlags = FIELD_MATRIX[ptype];
  return yup.object({
    title: yup.object({
      en: yup.string().nullable().max(255, t('property:step_general.validation.english_title_max')),
      fr: yup
        .string()
        .required(t('property:step_general.validation.french_title_required'))
        .max(255, t('property:step_general.validation.french_title_max')),
      es: yup.string().nullable().max(255, t('property:step_general.validation.spanish_title_max')),
      ar: yup
        .string()
        .required(t('property:step_general.validation.arabic_title_required'))
        .max(255, t('property:step_general.validation.arabic_title_max')),
    }),
    description: yup.object({
      en: yup.string().nullable(),
      fr: yup.string().required(t('property:step_general.validation.french_description_required')),
      es: yup.string().nullable(),
      ar: yup.string().required(t('property:step_general.validation.arabic_description_required')),
    }),

    monthlyPrice: yup
      .number()
      .min(0, t('property:step_general.validation.monthly_price_min'))
      .required(t('property:step_general.validation.monthly_price_required')),
    dailyPrice: yup
      .number()
      .min(0, t('property:step_general.validation.daily_price_min'))
      .required(t('property:step_general.validation.daily_price_required')),
    salePrice: yup
      .number()
      .min(0, t('property:step_general.validation.sale_price_min'))
      .required(t('property:step_general.validation.sale_price_required')),
    currency: yup.string().required(t('property:step_general.validation.currency_required')),
    yearBuilt: yup
      .number()
      .integer(t('property:step_general.validation.year_built_integer'))
      .required(t('property:step_general.validation.year_built_required')),
    type: yup
      .string()
      .oneOf(
        Object.values(PROPERTY_TYPE),
        t('property:step_general.validation.property_type_invalid')
      )
      .required(t('property:step_general.validation.property_type_required')),
    dailyPriceEnabled: yup.boolean(),
    monthlyPriceEnabled: yup.boolean(),
    hasVR: yup.boolean(),
    featured: yup.boolean(),
    furnishingStatus: yup
      .string()
      .oneOf(
        Object.values(FURNISHING_STATUS),
        t('property:step_general.validation.furnishing_status_invalid')
      )
      .required(t('property:step_general.validation.furnishing_status_required')),
    // Features validation
    features: yup.object({
      bedrooms: featureFlags.bedrooms
        ? yup
            .number()
            .typeError(t('property:step_general.validation.bedrooms_number'))
            .required(t('property:step_general.validation.bedrooms_required'))
            .min(0, t('property:step_general.validation.bedrooms_min'))
        : yup.number().nullable(),
      bathrooms: featureFlags.bathrooms
        ? yup
            .number()
            .typeError(t('property:step_general.validation.bathrooms_number'))
            .required(t('property:step_general.validation.bathrooms_required'))
            .min(0, t('property:step_general.validation.bathrooms_min'))
        : yup.number().nullable(),
      area: featureFlags.area
        ? yup
            .number()
            .typeError(t('property:step_general.validation.area_number'))
            .required(t('property:step_general.validation.area_required'))
            .min(0, t('property:step_general.validation.area_min'))
        : yup.number().nullable(),
      garages: featureFlags.garages
        ? yup
            .number()
            .typeError(t('property:step_general.validation.garages_number'))
            .required(t('property:step_general.validation.garages_required'))
            .min(0, t('property:step_general.validation.garages_min'))
        : yup.number().nullable(),
      floors: featureFlags.floors
        ? yup
            .number()
            .typeError(t('property:step_general.validation.floors_number'))
            .required(t('property:step_general.validation.floors_required'))
            .min(1, t('property:step_general.validation.floors_min'))
        : yup.number().nullable(),
    }),
    amenityIds: yup
      .array()
      .of(yup.number())
      .min(0, t('property:step_general.validation.amenities_invalid')),
  });
};

const StepGeneralDetails = forwardRef<FormStepRef, FormStepProps>((props, ref) => {
  const { data, next } = props;
  const { t } = useTranslation(['property', 'amenities', 'common']);
  const theme = useTheme();
  const selectedType = data?.type || PROPERTY_TYPE.HOUSE;

  const { items: amenities } = useAmenities({
    fetchItems: true,
    pageSize: 'all',
  });
  const [loadingAmenities, setLoadingAmenities] = useState(!amenities);

  useEffect(() => {
    if (amenities) {
      setLoadingAmenities(false);
    }
  }, [amenities]);

  // Define most used amenities based on common usage patterns
  const mostUsedAmenityNames = [
    'WiFi',
    'Air Conditioning',
    'Parking',
    'Swimming Pool',
    'Gym',
    'Balcony',
    'Garden',
    'Elevator',
    'Security',
    'Furnished',
    'Pet Friendly',
    'Terrace',
  ];

  // Group amenities into "Most Used" and "Others"
  const groupedAmenities = useMemo(() => {
    if (!amenities) {
      return { mostUsed: [], others: [] };
    }

    const mostUsed = amenities.filter((amenity) => mostUsedAmenityNames.includes(amenity.name));
    const others = amenities.filter((amenity) => !mostUsedAmenityNames.includes(amenity.name));

    return {
      mostUsed: mostUsed.sort((a, b) => a.name.localeCompare(b.name)),
      others: others.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [amenities]);

  // Create sorted options with most used first, then others
  const amenityOptions = useMemo(() => {
    if (!amenities) {
      return [];
    }

    const mostUsedIds = groupedAmenities.mostUsed.map((a) => a.id);
    const othersIds = groupedAmenities.others.map((a) => a.id);

    return [...mostUsedIds, ...othersIds];
  }, [groupedAmenities]);
  const getAmenityLabel = (id: number) => {
    const amenity = amenities?.find((a) => a.id === id);
    return amenity ? getTranslatedAmenityName(amenity.name, t) : '';
  };

  const schema = useMemo(() => buildSchema(selectedType as PROPERTY_TYPE, t), [selectedType, t]);

  const methods = useForm<StepGeneralDetailsData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: data?.title || { en: '', fr: '', es: '', ar: '' },
      description: data?.description || { en: '', fr: '', es: '', ar: '' },
      monthlyPrice: data?.monthlyPrice || 0,
      dailyPrice: data?.dailyPrice || 0,
      salePrice: data?.salePrice || 0,
      currency: data?.currency || 'MAD',
      yearBuilt: data?.yearBuilt || 0,
      type: data?.type || ('' as PROPERTY_TYPE),
      dailyPriceEnabled: data?.dailyPriceEnabled || false,
      monthlyPriceEnabled: data?.monthlyPriceEnabled || false,
      hasVR: data?.hasVR || false,
      featured: data?.featured || false,
      furnishingStatus: data?.furnishingStatus || FURNISHING_STATUS.UNFURNISHED,
      // Features
      features: data?.features || {
        bedrooms: null,
        bathrooms: null,
        area: null,
        garages: null,
        floors: null,
      },
      amenityIds: data?.amenityIds ?? [],
    },
  });

  useEffect(() => {
    methods.reset(
      {
        title: data?.title || { en: '', fr: '', es: '', ar: '' },
        description: data?.description || { en: '', fr: '', es: '', ar: '' },
        monthlyPrice: data?.monthlyPrice || 0,
        dailyPrice: data?.dailyPrice || 0,
        salePrice: data?.salePrice || 0,
        currency: data?.currency || 'MAD',
        yearBuilt: data?.yearBuilt || 0,
        type: data?.type || ('' as PROPERTY_TYPE),
        dailyPriceEnabled: data?.dailyPriceEnabled || false,
        monthlyPriceEnabled: data?.monthlyPriceEnabled || false,
        hasVR: data?.hasVR || false,
        featured: data?.featured || false,
        furnishingStatus: data?.furnishingStatus || FURNISHING_STATUS.UNFURNISHED,
        // Features
        features: data?.features || {
          bedrooms: null,
          bathrooms: null,
          area: null,
          garages: null,
          floors: null,
        },
        amenityIds: data?.amenityIds ?? [],
      },
      { keepDefaultValues: true }
    );
  }, [data, methods]);

  // Watch for type changes to update features dynamically
  const watchedType = methods.watch('type') as PROPERTY_TYPE;
  const currentType = watchedType || selectedType;
  const currentFeatureFlags = FIELD_MATRIX[currentType];

  useEffect(() => {
    methods.reset(methods.getValues(), { keepValues: true });
  }, [schema]);

  // Update schema when type changes
  useEffect(() => {
    methods.clearErrors();

    // Clear feature values that are not relevant for the new type
    if (!currentFeatureFlags.bedrooms) {
      methods.setValue('features.bedrooms', null);
    }
    if (!currentFeatureFlags.bathrooms) {
      methods.setValue('features.bathrooms', null);
    }
    if (!currentFeatureFlags.area) {
      methods.setValue('features.area', null);
    }
    if (!currentFeatureFlags.garages) {
      methods.setValue('features.garages', null);
    }
    if (!currentFeatureFlags.floors) {
      methods.setValue('features.floors', null);
    }
  }, [currentType, methods, currentFeatureFlags]);

  useImperativeHandle(ref, () => ({
    async submit() {
      await methods.handleSubmit((formData) => next(formData))();
    },
  }));

  const dailyEnabled = methods.watch('dailyPriceEnabled', false);
  const monthlyEnabled = methods.watch('monthlyPriceEnabled', false);

  if (loadingAmenities) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper
          sx={{
            p: 6,
            backgroundColor: theme.palette.background.paper,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            gap: 2,
          }}
        >
          <CircularProgress size={50} thickness={4} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" color="text.secondary">
            {t('property:loading.amenities')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('property:loading.amenities_desc')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                {t('property:step_general.basic_info')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <RHFSelect name="type" label={t('property:step_general.property_type')} fullWidth>
                    {Object.values(PROPERTY_TYPE).map((typeValue) => (
                      <MenuItem key={typeValue} value={typeValue}>
                        {t(`property:types.${typeValue.toLowerCase()}`)}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFSelect
                    name="furnishingStatus"
                    label={t('property:step_general.furnishing_status')}
                    fullWidth
                  >
                    {Object.values(FURNISHING_STATUS).map((status) => (
                      <MenuItem key={status} value={status}>
                        {t(`property:furnishing_status.${status.toLowerCase()}`)}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFSwitch
                    name="hasVR"
                    label={t('property:step_general.has_vr')}
                    sx={{ color: theme.palette.primary.main }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFSwitch
                    name="featured"
                    label={t('property:step_general.featured_property')}
                    sx={{ color: theme.palette.primary.main }}
                  />
                </Grid>
              </Grid>

              {/* Title Section */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  {t('property:step_general.property_title')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="title.fr"
                      label={`${t('property:step_general.french')} *`}
                      InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="title.ar"
                      label={`${t('property:step_general.arabic')} *`}
                      InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="title.en"
                      label={t('property:step_general.english')}
                      InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="title.es"
                      label={t('property:step_general.spanish')}
                      InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Description Section */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  {t('property:step_general.property_description')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="description.fr"
                      label={`${t('property:step_general.french')} *`}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="description.ar"
                      label={`${t('property:step_general.arabic')} *`}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="description.en"
                      label={t('property:step_general.english')}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="description.es"
                      label={t('property:step_general.spanish')}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Pricing Details Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                {t('property:step_general.pricing_details')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <RHFSwitch
                    name="dailyPriceEnabled"
                    label={t('property:step_general.enable_daily_price')}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <RHFTextField
                    name="dailyPrice"
                    label={t('property:step_general.daily_price')}
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
                    label={t('property:step_general.enable_monthly_price')}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <RHFTextField
                    name="monthlyPrice"
                    label={t('property:step_general.monthly_price')}
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
                      label={t('property:step_general.sale_price')}
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
          {currentType !== PROPERTY_TYPE.LAND && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                  {t('property:step_general.property_details')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="yearBuilt"
                      label={t('property:step_general.year_built')}
                      type="number"
                      InputProps={{ inputProps: { min: 1800, max: new Date().getFullYear() } }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Property Features Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
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
                {t('property:step_general.property_features')}
                <Chip
                  label={currentType.replace('_', ' ')}
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
                {currentFeatureFlags.bedrooms && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="features.bedrooms"
                      label={t('property:step_general.bedrooms')}
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
                {currentFeatureFlags.bathrooms && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="features.bathrooms"
                      label={t('property:step_general.bathrooms')}
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
                {currentFeatureFlags.area && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="features.area"
                      label={`${t('property:step_general.area')} (${t('common:area_unit')})`}
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
                {currentFeatureFlags.garages && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="features.garages"
                      label={t('property:step_general.garages')}
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
                {currentFeatureFlags.floors && (
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="features.floors"
                      label={t('property:step_general.floors')}
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
              </Grid>
            </Paper>
          </Grid>

          {/* Amenities Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: 'text.primary',
                  pb: 1,
                }}
              >
                {t('property:step_general.amenities')}
              </Typography>
              <RHFAutocomplete
                name="amenityIds"
                label={t('property:step_general.select_amenities')}
                multiple
                disableCloseOnSelect
                options={amenityOptions}
                fullWidth
                groupBy={(option: number) => {
                  const amenity = amenities?.find((a) => a.id === option);
                  if (!amenity) {
                    return 'Others';
                  }
                  return mostUsedAmenityNames.includes(amenity.name)
                    ? t('property:step_general.most_used')
                    : t('property:step_general.others');
                }}
                renderGroup={(params) => (
                  <li key={params.key}>
                    <Box
                      sx={{
                        position: 'sticky',
                        top: '-8px',
                        pt: 1,
                        pb: 1,
                        px: 2,
                        backgroundColor:
                          params.group === t('property:step_general.most_used')
                            ? 'primary.lighter'
                            : 'grey.50',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color:
                          params.group === t('property:step_general.most_used')
                            ? 'primary.dark'
                            : 'text.secondary',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        zIndex: 1,
                      }}
                    >
                      {params.group}
                    </Box>
                    <ul style={{ margin: 0, padding: 0 }}>{params.children}</ul>
                  </li>
                )}
                getOptionLabel={(option: string | number) =>
                  typeof option === 'number' ? getAmenityLabel(option) : ''
                }
                renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: number) => {
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
                renderTags={(
                  selected: number[],
                  getTagProps: (params: { index: number }) => Record<string, unknown>
                ) =>
                  selected.map((option: number, index: number) => (
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
                slotProps={{
                  paper: {
                    sx: {
                      border: '1px solid !important',
                      borderColor: '#9E9E9E !important  ',
                    },
                  },
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
});

export default StepGeneralDetails;
