import React, { forwardRef, useImperativeHandle, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Grid, Paper, Typography, useTheme } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { FormStepProps, FormStepRef } from '@common/components/lib/navigation/FormStepper';
import RHFAutocomplete from '@common/components/lib/react-hook-form/RHFAutocomplete';
import useLocations from '@modules/locations/hooks/api/useLocations';
import useAgents from '@modules/agents/hooks/api/useAgents';
import { Id } from '@common/defs/types';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { City } from '@modules/locations/defs/types';
import { Agent } from '@modules/agents/defs/types';
import { RHFTextField } from '@common/components/lib/react-hook-form';
import { useTranslation } from 'react-i18next';
import { getTranslatedText } from '@common/utils/translations';

export interface StepLocationAgentsData {
  cityId: Id;
  streetAddress: {
    en?: string;
    fr: string;
    es?: string;
  };
  latitude: number;
  longitude: number;
  agentIds: Id[];
}

interface StructuredLocationData {
  location: {
    cityId: number;
    streetAddress: {
      en?: string;
      fr: string;
      es?: string;
    };
    latitude: number;
    longitude: number;
  };
  agentIds: Id[];
  locationId?: number;
}

const buildSchema = (t: (key: string) => string) =>
  yup.object({
    cityId: yup
      .number()
      .required(t('property:step_location_agents.validation.city_required'))
      .notOneOf([0], t('property:step_location_agents.validation.city_invalid')),
    streetAddress: yup.object({
      en: yup.string().nullable(),
      fr: yup
        .string()
        .required(t('property:step_location_agents.validation.french_street_required')),
      es: yup.string().nullable(),
      ar: yup
        .string()
        .required(t('property:step_location_agents.validation.arabic_street_required')),
    }),
    latitude: yup
      .number()
      .required(t('property:step_location_agents.validation.latitude_required'))
      .min(-90, t('property:step_location_agents.validation.latitude_range'))
      .max(90, t('property:step_location_agents.validation.latitude_range')),
    longitude: yup
      .number()
      .required(t('property:step_location_agents.validation.longitude_required'))
      .min(-180, t('property:step_location_agents.validation.longitude_range'))
      .max(180, t('property:step_location_agents.validation.longitude_range')),
    agentIds: yup
      .array()
      .of(yup.number())
      .min(1, t('property:step_location_agents.validation.agents_required')),
  });

const StepLocationAgents = forwardRef<FormStepRef, FormStepProps>(({ data, next }, ref) => {
  const { t, i18n } = useTranslation(['property']);
  const { readAllCitiesWithRegions } = useLocations();
  const { readAll: readAllAgents } = useAgents();
  const [cities, setCities] = useState<City[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [hasFormBeenModified, setHasFormBeenModified] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await readAllCitiesWithRegions();
      if (response.success && response.data?.items) {
        setCities(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await readAllAgents(1, 'all');
      if (response.success && response.data?.items) {
        setAgents(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const methods = useForm<StepLocationAgentsData>({
    resolver: yupResolver(buildSchema(t)),
    defaultValues: {
      cityId: data?.location?.cityId || 0,
      streetAddress: data?.location?.streetAddress || { en: '', fr: '', es: '', ar: '' },
      latitude: data?.location?.latitude || 0,
      longitude: data?.location?.longitude || 0,
      agentIds: data?.agentIds || [],
    },
  });

  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name) {
        setHasFormBeenModified(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  useImperativeHandle(ref, () => ({
    async submit() {
      await methods.handleSubmit((formData) => {
        const isEditMode = data?.locationId;

        const structuredData: StructuredLocationData = {
          location: {
            cityId: formData.cityId,
            streetAddress: formData.streetAddress,
            latitude: formData.latitude,
            longitude: formData.longitude,
          },
          agentIds: formData.agentIds,
        };

        if (isEditMode) {
          structuredData.locationId = data.locationId;
        }

        next(structuredData);
      })();
    },
  }));

  useEffect(() => {
    if (selectedCity) {
      methods.setValue('latitude', selectedCity.latitude || 0);
      methods.setValue('longitude', selectedCity.longitude || 0);
    }
  }, [selectedCity, methods]);

  useEffect(() => {
    const hasLocationData = data?.location?.cityId && data.location.cityId !== 0;
    const hasStreetAddress =
      data?.location?.streetAddress &&
      (data.location.streetAddress.fr || data.location.streetAddress.ar);

    if ((hasLocationData || hasStreetAddress) && !hasFormBeenModified) {
      methods.reset({
        cityId: data?.location?.cityId || 0,
        streetAddress: data?.location?.streetAddress || { en: '', fr: '', es: '', ar: '' },
        latitude: data?.location?.latitude || 0,
        longitude: data?.location?.longitude || 0,
        agentIds: data?.agentIds || [],
      });
    }
  }, [data, methods, hasFormBeenModified]);

  const sortedCities = useMemo(() => {
    if (!cities) {
      return [];
    }
    return [...cities].sort((a, b) => {
      const regionCompare = (a.region?.names?.fr || '').localeCompare(b.region?.names?.fr || '');
      if (regionCompare !== 0) {
        return regionCompare;
      }
      return (a.names?.fr || '').localeCompare(b.names?.fr || '');
    });
  }, [cities]);

  const sortedAgents = useMemo(() => {
    if (!agents || agents.length === 0) {
      return [];
    }
    return [...agents].sort((a, b) => {
      const agencyCompare = (a.agencyName ?? '').localeCompare(b.agencyName ?? '');
      if (agencyCompare !== 0) {
        return agencyCompare;
      }
      return (a.user?.name ?? '').localeCompare(b.user?.name ?? '');
    });
  }, [agents]);

  const handleCityChange = (id: number) => {
    const city = cities?.find((city) => city.id === id);
    setSelectedCity(city || null);
  };

  if (loadingCities || loadingAgents) {
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
            {t('property:step_location_agents.loading_cities_agents')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('property:step_location_agents.loading_data_desc')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  const cityOptions = sortedCities.map((city: City) => city.id);
  const agentOptions = sortedAgents.map((agent: Agent) => agent.id);

  const getCityLabel = (id: number) => {
    const city = cities.find((c) => c.id === id);
    if (!city) {
      return '';
    }
    return getTranslatedText(city.names, i18n.language, city.names?.en || '');
  };

  const getAgentLabel = (id: number) => {
    const ag = agents.find((a) => a.id === id);
    return ag?.user?.name ?? '';
  };

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                {t('property:step_location_agents.location_details')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <RHFAutocomplete
                    name="cityId"
                    label={t('property:step_location_agents.select_city')}
                    options={cityOptions}
                    fullWidth
                    getOptionLabel={(option) =>
                      typeof option === 'number' ? getCityLabel(option) : ''
                    }
                    groupBy={(option) => {
                      const city = cities.find((c) => c.id === option);
                      return getTranslatedText(
                        city?.region?.names,
                        i18n.language,
                        city?.region?.names?.en || ''
                      );
                    }}
                    onChange={(_, id) => handleCityChange(Number(id))}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  {t('property:step_location_agents.street_address')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="streetAddress.fr"
                      label={`${t('property:step_location_agents.french')} *`}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="streetAddress.ar"
                      label={`${t('property:step_location_agents.arabic')} *`}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="streetAddress.en"
                      label={t('property:step_location_agents.english')}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="streetAddress.es"
                      label={t('property:step_location_agents.spanish')}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  {t('property:step_location_agents.coordinates')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="latitude"
                      label={t('property:step_location_agents.latitude')}
                      type="number"
                      fullWidth
                      inputProps={{
                        step: '0.000001',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="longitude"
                      label={t('property:step_location_agents.longitude')}
                      type="number"
                      fullWidth
                      inputProps={{
                        step: '0.000001',
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                {t('property:step_location_agents.associate_agents')}
              </Typography>
              <RHFAutocomplete
                name="agentIds"
                label={t('property:step_location_agents.select_agents')}
                multiple
                options={agentOptions}
                fullWidth
                getOptionLabel={(option) =>
                  typeof option === 'number' ? getAgentLabel(option) : ''
                }
                groupBy={(option) => {
                  const ag = agents.find((a) => a.id === option);
                  return ag?.agencyName ?? '';
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
});

export default StepLocationAgents;
