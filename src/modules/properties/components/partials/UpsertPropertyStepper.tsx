import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Id } from '@common/defs/types';
import FormStepper, {
  FormStep,
  FormStepProps,
  FormStepRef,
  StepComponent,
} from '@common/components/lib/navigation/FormStepper';
import Routes from '@common/defs/routes';
import useProperties, {
  CreateOneInput,
  UpdateOneInput,
} from '@modules/properties/hooks/api/useProperties';
import { Property } from '@modules/properties/defs/types';
import StepGeneralDetails from '@modules/properties/components/partials/upsert-property-steps/StepGeneralDetails';
import StepLocationAgents from './upsert-property-steps/StepLocationAgents';
import StepImages from './upsert-property-steps/StepImages';

export enum CREATE_PROPERTY_STEP_ID {
  GENERAL = 'general',
  LOCATION_AGENTS = 'location-agents',
  IMAGES = 'images',
}

interface UpsertPropertyStepperProps {
  itemId?: Id;
}

const mapPropertyToInput = (property: Property): CreateOneInput => {
  // Extract feature data from the first feature object (since it's a hasMany relationship but should be one-to-one)
  const featureData = property.features?.[0] || {};

  return {
    title: property.title,
    description: property.description,
    monthlyPrice: property.monthlyPrice,
    dailyPrice: property.dailyPrice,
    salePrice: property.salePrice,
    currency: property.currency,
    dailyPriceEnabled: property.dailyPriceEnabled,
    monthlyPriceEnabled: property.monthlyPriceEnabled,
    type: property.type,
    yearBuilt: property.yearBuilt,
    hasVR: property.hasVR,
    featured: property.featured,
    furnishingStatus: property.furnishingStatus,
    locationId: property.location?.id,
    agentIds: property.agents.map((a) => a.id),
    amenityIds: property.amenities.map((a) => a.id),
    images: property.images.map((img) => ({
      imageId: img.imageId,
      caption: img.caption ?? '',
      ordering: img.ordering,
      preview: img.upload.url,
    })),
    // Keep features nested (matching backend structure)
    features: {
      bedrooms: featureData.bedrooms ?? 0,
      bathrooms: featureData.bathrooms ?? 0,
      area: featureData.area ?? 0,
      garages: featureData.garages ?? 0,
      floors: featureData.floors ?? 0,
    },
    location: property.location
      ? {
          cityId: property.location.cityId || property.location.city?.id || 0,
          streetAddress: property.location.streetAddress,
          latitude: property.location.latitude || 0,
          longitude: property.location.longitude || 0,
        }
      : undefined,
  };
};

const UpsertPropertyStepper = ({ itemId }: UpsertPropertyStepperProps) => {
  const { t } = useTranslation(['property', 'common', 'amenities']);
  const router = useRouter();
  const theme = useTheme();

  const { createOne, updateOne, readOne } = useProperties();

  const [item, setItem] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (itemId) {
      setLoading(true);
      (async () => {
        const response = await readOne(itemId);
        if (response.success) {
          setItem(response.data?.item as Property);
        }
        setLoading(false);
      })();
    }
  }, [itemId]);

  const steps: FormStep<CREATE_PROPERTY_STEP_ID>[] = [
    {
      id: CREATE_PROPERTY_STEP_ID.GENERAL,
      label: t('property:form.general_details'),
      component: StepGeneralDetails as unknown as StepComponent<FormStepRef, FormStepProps>,
    },
    {
      id: CREATE_PROPERTY_STEP_ID.IMAGES,
      label: t('property:form.images'),
      component: StepImages as unknown as StepComponent<FormStepRef, FormStepProps>,
    },
    {
      id: CREATE_PROPERTY_STEP_ID.LOCATION_AGENTS,
      label: t('property:form.location_agents'),
      component: StepLocationAgents as unknown as StepComponent<FormStepRef, FormStepProps>,
    },
  ];

  const onSubmit = async (data: CreateOneInput) => {
    let response;
    if (itemId) {
      response = await updateOne(itemId, data as UpdateOneInput, {
        displayProgress: true,
        displaySuccess: true,
      });
    } else {
      response = await createOne(data, {
        displayProgress: true,
        displaySuccess: true,
      });
    }
    if (response.success) {
      router.push(Routes.Properties.ReadAll);
      return true;
    }
    return false;
  };

  if (itemId && loading) {
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
            minHeight: 400,
            gap: 3,
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500 }}>
            {t('property:loading.property_details')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('property:loading.please_wait')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <FormStepper<CreateOneInput, CREATE_PROPERTY_STEP_ID>
      id={`upsert-property-stepper-${itemId ?? 'new'}`}
      steps={steps}
      onSubmit={onSubmit}
      initialData={item ? mapPropertyToInput(item) : undefined}
    />
  );
};

export default UpsertPropertyStepper;
