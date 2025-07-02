// StepLocationAgents.tsx
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
import { Location } from '@modules/locations/defs/types';
import { Agent } from '@modules/agents/defs/types';
import { RHFTextField } from '@common/components/lib/react-hook-form';

export interface StepLocationAgentsData {
  locationId: Id;
  latitude: number;
  longitude: number;
  agentIds: Id[];
}

const schema = yup.object({
  locationId: yup
    .number()
    .required('Location is required')
    .notOneOf([0], 'Please select a valid location'),
  latitude: yup
    .number()
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: yup
    .number()
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  agentIds: yup.array().of(yup.number()).min(1, 'At least one agent must be selected'),
});

const StepLocationAgents = forwardRef<FormStepRef, FormStepProps>(({ data, next }, ref) => {
  const { items: locations } = useLocations({ fetchItems: true, pageSize: 'all' });
  const { items: agents } = useAgents({ fetchItems: true });
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const theme = useTheme();

  console.log('data: ', data);

  const methods = useForm<StepLocationAgentsData>({
    resolver: yupResolver(schema),
    defaultValues: {
      locationId: data?.locationId || 0,
      latitude: data?.location?.latitude || 0,
      longitude: data?.location?.longitude || 0,
      agentIds: data?.agentIds || [],
    },
  });

  useImperativeHandle(ref, () => ({
    async submit() {
      await methods.handleSubmit((formData) => next(formData))();
    },
  }));

  useEffect(() => {
    if (selectedLocation) {
      methods.setValue('latitude', selectedLocation.latitude);
      methods.setValue('longitude', selectedLocation.longitude);
    }
  }, [selectedLocation, methods]);

  useEffect(() => {
    methods.reset({
      locationId: data?.locationId || 0,
      latitude: data?.location?.latitude || 0,
      longitude: data?.location?.longitude || 0,
      agentIds: data?.agentIds || [],
    });
  }, [data, methods]);

  const sortedLocations = useMemo(() => {
    if (!locations) {
      return [];
    }
    return [...locations].sort((a, b) => {
      const regionCompare = a.region.localeCompare(b.region);
      if (regionCompare !== 0) {
        return regionCompare;
      }
      return a.city.localeCompare(b.city);
    });
  }, [locations]);

  const sortedAgents = useMemo(() => {
    if (!agents) {
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

  const handleLocationChange = (id: number) => {
    const location = locations?.find((loc) => loc.id === id);
    setSelectedLocation(location || null);
  };

  if (!locations || !agents) {
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
            Loading Locations & Agents...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we load the required data
          </Typography>
        </Paper>
      </Box>
    );
  }

  const locationOptions = sortedLocations.map((loc: Location) => loc.id);
  const agentOptions = sortedAgents.map((agent: Agent) => agent.id);

  const getLocationLabel = (id: number) => {
    const loc = locations.find((l) => l.id === id);
    return loc ? `${loc.city}` : '';
  };

  const getAgentLabel = (id: number) => {
    const ag = agents.find((a) => a.id === id);
    return ag?.user?.name ?? '';
  };

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <RHFAutocomplete
                    name="locationId"
                    label="Select Location"
                    options={locationOptions}
                    fullWidth
                    getOptionLabel={(option) =>
                      typeof option === 'number' ? getLocationLabel(option) : ''
                    }
                    groupBy={(option) => {
                      const loc = locations.find((l) => l.id === option);
                      return loc?.region ?? '';
                    }}
                    onChange={(_, id) => handleLocationChange(Number(id))}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="latitude"
                    label="Latitude"
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
                    label="Longitude"
                    type="number"
                    fullWidth
                    inputProps={{
                      step: '0.000001',
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Associate Agents
              </Typography>
              <RHFAutocomplete
                name="agentIds"
                label="Select Agents"
                multiple
                options={agentOptions}
                fullWidth
                placeholder="Choose agents"
                getOptionLabel={(option) =>
                  typeof option === 'number' ? getAgentLabel(option) : ''
                }
                groupBy={(option) => {
                  const ag = agents.find((a) => a.id === option);
                  return ag?.agencyName ?? '';
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </FormProvider>
  );
});

export default StepLocationAgents;
