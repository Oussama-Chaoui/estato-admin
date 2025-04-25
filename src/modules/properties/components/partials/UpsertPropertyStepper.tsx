import { useEffect, useState } from 'react';
import FormStepper, {
  FormStep,
  FormStepProps,
  FormStepRef,
  StepComponent,
} from '@common/components/lib/navigation/FormStepper';
import Routes from '@common/defs/routes';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useProperties, {
  CreateOneInput,
  UpdateOneInput,
} from '@modules/properties/hooks/api/useProperties';
import { Feature, Property } from '@modules/properties/defs/types';
import StepGeneralDetails from '@modules/properties/components/partials/upsert-property-steps/StepGeneralDetails';
import { Id } from '@common/defs/types';
import StepLocationAgents from './upsert-property-steps/StepLocationAgents';
import StepFeaturesAmenities from './upsert-property-steps/StepFeaturesAmenities';
import StepImages from './upsert-property-steps/StepImages';
import { Box, CircularProgress, Paper, Typography, useTheme } from '@mui/material';
import { Location } from '@modules/locations/defs/types';

export enum CREATE_PROPERTY_STEP_ID {
  GENERAL = 'general',
  LOCATION_AGENTS = 'location-agents',
  FEATURES_AMENITIES = 'features-amenities',
  IMAGES = 'images'
}

interface UpsertPropertyStepperProps {
  itemId?: Id;
}

const mapPropertyToInput = (property: Property): CreateOneInput => ({
  title: property.title,
  description: property.description,
  monthlyPrice: property.monthlyPrice,
  dailyPrice: property.dailyPrice,
  salePrice: property.salePrice,
  currency: property.currency,
  dailyPriceEnabled: property.dailyPriceEnabled,
  monthlyPriceEnabled: property.monthlyPriceEnabled,
  type: property.type,
  status: property.status,
  streetAddress: property.streetAddress,
  yearBuilt: property.yearBuilt,
  lotSize: property.lotSize,
  hasVR: property.hasVR,
  locationId: property.location.id,
  agentIds: property.agents.map((a) => a.id),
  amenityIds: property.amenities.map((a) => a.id),
  images: property.images.map(img => ({
    imageId: img.imageId,
    caption: img.caption ?? '',
    ordering: img.ordering,
    preview: img.upload.url
  })),
  features: {
    id: property.features[0]?.id ?? 0,
    bedrooms: property.features[0]?.bedrooms ?? 0,
    bathrooms: property.features[0]?.bathrooms ?? 0,
    area: property.features[0]?.area ?? 0,
    garages: property.features[0]?.garages ?? 0,
    floors: property.features[0]?.floors ?? 0,
    pool: Boolean(property.features[0]?.pool),
    garden: Boolean(property.features[0]?.garden),
  },
  location: {
    id: property.location.id,
    region: property.location.region,
    city: property.location.city,
    latitude: property.location.latitude,
    longitude: property.location.longitude,
  },
});

const UpsertPropertyStepper = ({ itemId }: UpsertPropertyStepperProps) => {
  const { t } = useTranslation(['property']);
  const router = useRouter();
  const theme = useTheme()

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
      id: CREATE_PROPERTY_STEP_ID.FEATURES_AMENITIES,
      label: t('property:form.features_amenities'),
      component: StepFeaturesAmenities as unknown as StepComponent<FormStepRef, FormStepProps>,
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
        <Paper sx={{
          p: 6,
          backgroundColor: theme.palette.background.paper,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          gap: 3
        }}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: theme.palette.primary.main }}
          />
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
