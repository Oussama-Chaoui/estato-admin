import {
  Apartment,
  CalendarToday,
  CheckCircle,
  Edit,
  Delete,
  LocationOn,
  SquareFoot,
  VerifiedUser,
  LockClock,
  AdminPanelSettings,
  GpsFixed,
  Email,
  Phone,
  Business,
  PeopleAlt,
  Bed,
  Bathtub,
  Garage,
  AccessTime,
  PriceCheck,
  PhotoCamera,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar,
  Button,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { Property } from '@modules/properties/defs/types';
import { getAmenityIcon } from '@modules/properties/defs/utils';
import PropertyBookingCalendar from './PropertyBookingCalendar';
import { Agent } from '@modules/agents/defs/types';
import { useRouter } from 'next/router';
import { useDialogContext } from '@common/contexts/DialogContext';
import useProperties from '@modules/properties/hooks/api/useProperties';
import PropertyDisplay from './PropertyDisplay';
import Routes from '@common/defs/routes';
import { useTranslation } from 'react-i18next';
import { getTranslatedText } from '@common/utils/translations';
import { getTranslatedAmenityName } from '@common/utils/amenities';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  const { t, i18n } = useTranslation(['property', 'amenities']);
  const router = useRouter();
  const { openConfirmDialog } = useDialogContext();
  const { deleteOne } = useProperties();

  const technicalDetails = [
    {
      icon: <LocationOn />,
      label: t('property:details.location'),
      value: `${getTranslatedText(
        property.location.city?.names,
        i18n.language,
        t('property:details.unknown_location')
      )}, ${getTranslatedText(
        property.location.city?.region?.names,
        i18n.language,
        t('property:details.unknown_location')
      )}`,
    },
    {
      icon: <Apartment />,
      label: t('property:details.type'),
      value: t(`property:types.${property.type.toLowerCase()}`),
    },
    {
      icon: <CalendarToday />,
      label: t('property:details.year_built'),
      value: property.yearBuilt,
    },
    {
      icon: <LockClock />,
      label: t('property:details.created_at'),
      value: new Date(property.createdAt).toLocaleString(i18n.language),
    },
  ];

  const features = [
    {
      icon: <Bed />,
      label: t('property:details.bedrooms'),
      value: property.features[0]?.bedrooms || 0,
    },
    {
      icon: <Bathtub />,
      label: t('property:details.bathrooms'),
      value: property.features[0]?.bathrooms || 0,
    },
    {
      icon: <SquareFoot />,
      label: t('property:details.area'),
      value: `${property.features[0]?.area || 0} m²`,
    },
    {
      icon: <Garage />,
      label: t('property:details.garages'),
      value: property.features[0]?.garages || 0,
    },
  ];

  const mapUrl = `https://maps.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`;

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 3, p: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            mb: 4,
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: '100%', lg: '65%' },
              order: { xs: 2, lg: 1 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                  lineHeight: 1.2,
                }}
              >
                {getTranslatedText(property.title, i18n.language, t('property:details.untitled'))}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 1,
                mb: 3,
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', md: '1rem' },
              }}
            >
              {getTranslatedText(
                property.description,
                i18n.language,
                t('property:details.no_description')
              )}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={`ID: ${property.id}`}
                variant="filled"
                sx={{
                  backgroundColor: 'secondary.light',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  px: 1.5,
                  py: 1,
                  minWidth: 90,
                  borderRadius: 1,
                  textTransform: 'capitalize',
                  letterSpacing: 0.2,
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                  },
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: { xs: 'center', lg: 'right' },
              p: { xs: 2, md: 2.5 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              backgroundColor: 'background.paper',
              transition: 'all 0.3s ease',
              minWidth: { xs: '100%', lg: 320 },
              maxWidth: { xs: '100%', lg: 380 },
              flexShrink: 0,
              alignSelf: { xs: 'stretch', lg: 'flex-start' },
              order: { xs: 1, lg: 2 },
              '&:hover': {
                boxShadow: 1,
                borderColor: 'primary.light',
              },
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: { xs: 1.5, md: 1 },
                    borderRadius: 1,
                    backgroundColor: 'primary.lighter',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <PriceCheck
                      fontSize="small"
                      color="primary"
                      sx={{ fontSize: { xs: '20px', md: '18px' } }}
                    />
                    <Typography
                      variant="overline"
                      sx={{
                        color: 'text.secondary',
                        letterSpacing: '0.5px',
                        lineHeight: 1,
                        fontSize: { xs: '0.75rem', md: '0.7rem' },
                      }}
                    >
                      {t('property:details.sale_price')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 0.5,
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: 'primary.dark',
                        lineHeight: 1,
                        fontSize: { xs: '1.5rem', md: '1.25rem' },
                      }}
                    >
                      {property.salePrice.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.9rem', md: '0.875rem' } }}
                    >
                      {property.currency}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item container xs={12} spacing={1}>
                {property.monthlyPriceEnabled && (
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: { xs: 1.5, md: 1 },
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <CalendarToday
                          fontSize="small"
                          color="primary"
                          sx={{ fontSize: { xs: '18px', md: '16px' } }}
                        />
                        <Typography
                          variant="overline"
                          sx={{
                            color: 'text.secondary',
                            letterSpacing: '0.5px',
                            fontSize: { xs: '0.75rem', md: '0.7rem' },
                          }}
                        >
                          {t('property:details.monthly')}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1rem', md: '0.875rem' },
                          }}
                        >
                          {property.monthlyPrice.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.8rem', md: '0.75rem' } }}
                        >
                          {property.currency}/{t('property:details.per_month')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {property.dailyPriceEnabled && (
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: { xs: 1.5, md: 1 },
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <AccessTime
                          fontSize="small"
                          color="primary"
                          sx={{ fontSize: { xs: '18px', md: '16px' } }}
                        />
                        <Typography
                          variant="overline"
                          sx={{
                            color: 'text.secondary',
                            letterSpacing: '0.5px',
                            fontSize: { xs: '0.75rem', md: '0.7rem' },
                          }}
                        >
                          {t('property:details.daily')}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1rem', md: '0.875rem' },
                          }}
                        >
                          {property.dailyPrice.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.8rem', md: '0.75rem' } }}
                        >
                          {property.currency}/{t('property:details.per_day')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            color="primary"
            onClick={() =>
              router.push(Routes.Properties.UpdateOne.replace('{id}', property.id.toString()))
            }
          >
            {t('property:details.edit_property')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            color="error"
            onClick={() => {
              openConfirmDialog(
                t('property:details.delete_confirmation_title'),
                t('property:details.delete_confirmation_message'),
                async () => {
                  const response = await deleteOne(property.id, {
                    displayProgress: true,
                    displaySuccess: true,
                  });
                  if (response.success) {
                    router.push(Routes.Properties.ReadAll);
                  }
                },
                t('property:details.delete_confirm_button'),
                'error'
              );
            }}
          >
            {t('property:details.delete_property')}
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'text.primary',
            }}
          >
            <PhotoCamera color="primary" fontSize="medium" />
            {t('property:details.property_images')}
          </Typography>
          <PropertyDisplay images={property.images} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'text.primary',
            }}
          >
            <CalendarToday fontSize="medium" color="primary" />
            {t('property:details.availabilities_booking')}
          </Typography>
          <PropertyBookingCalendar property={property} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'text.primary',
            }}
          >
            <AdminPanelSettings fontSize="large" color="primary" />
            {t('property:details.property_specifications')}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} ml={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CheckCircle fontSize="small" color="primary" />
                {t('property:details.key_features')}
              </Typography>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={`feature-${index}`}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        height: '100%',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ color: 'primary.main' }}>{feature.icon}</Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {feature.label}
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {feature.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} ml={2}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <VerifiedUser fontSize="small" color="primary" />
                {t('property:details.technical_specifications')}
              </Typography>
              <Grid container spacing={3}>
                {technicalDetails.map((detail, index) => (
                  <Grid item xs={12} sm={6} md={3} key={`detail-${index}`}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        height: '100%',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ color: 'primary.main' }}>{detail.icon}</Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {detail.label}
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {detail.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'text.primary',
            }}
          >
            <CheckCircle fontSize="large" color="primary" />
            {t('property:details.property_amenities')}
          </Typography>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 1,
            }}
          >
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {property.amenities.map((amenity, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        height: '100%',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          mb: 1,
                        }}
                      >
                        {getAmenityIcon(amenity.icon, { fontSize: 'small' })}
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        {getTranslatedAmenityName(amenity.name, t)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {t('property:details.total_listed_amenities')}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: 'primary.light',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <CheckCircle fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={600} color="primary.dark">
                    {property.amenities.length} {t('property:details.amenities_count')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LocationOn fontSize="medium" color="primary" />
            {t('property:details.property_location')}
          </Typography>
          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {`${getTranslatedText(
                  property.location.city?.names,
                  i18n.language,
                  t('property:details.unknown_location')
                )}, ${getTranslatedText(
                  property.location.city?.region?.names,
                  i18n.language,
                  t('property:details.unknown_location')
                )}`}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                <GpsFixed fontSize="small" color="action" />
                <Chip
                  label={`Lat: ${property.location.latitude}, Lng: ${property.location.longitude}`}
                  variant="outlined"
                  size="small"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>
              <Box
                sx={{
                  height: 250,
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={mapUrl}
                  title={t('property:details.property_location_map')}
                  style={{
                    border: 0,
                    filter: 'grayscale(20%)',
                  }}
                  loading="lazy"
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    boxShadow: 'inset 0 0 16px rgba(0,0,0,0.08)',
                  }}
                />
              </Box>
            </Box>
          </Card>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'text.primary',
            }}
          >
            <PeopleAlt color="primary" fontSize="medium" />
            {t('property:details.associated_agents')}
          </Typography>

          <Grid container spacing={4}>
            {property.agents.map((agent: Agent) => (
              <Grid item xs={12} key={agent.id}>
                <Card
                  sx={{
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                    height: '100%',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    router.push(Routes.Users.ReadOne.replace('{id}', agent.user.id.toString()))
                  }
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 3,
                        alignItems: 'flex-start',
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        {agent.user.photo ? (
                          <CardMedia
                            component="img"
                            src={agent.user.photo.url}
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: 1,
                              objectFit: 'cover',
                              border: '3px solid',
                              borderColor: 'primary.light',
                            }}
                            alt={agent.user.name}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 120,
                              height: 120,
                              bgcolor: 'primary.main',
                              fontSize: 40,
                              border: '3px solid',
                              borderColor: 'primary.light',
                            }}
                          >
                            {agent.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </Avatar>
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -8,
                            right: -8,
                            backgroundColor: 'success.main',
                            color: 'white',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white',
                          }}
                        >
                          <VerifiedUser fontSize="small" />
                        </Box>
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              color: 'primary.dark',
                              mb: 0.5,
                            }}
                          >
                            {agent.user.name}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Chip
                              label={agent.licenceNumber}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            mb: 2,
                            p: 1.5,
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                          }}
                        >
                          <Business color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {agent.agencyName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {agent.agencyAddress}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={1}
                          >
                            {t('property:details.specialties')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={`${agent.experience}+ ${t(
                                'property:details.years_experience'
                              )}`}
                              size="small"
                              color="info"
                              sx={{ fontWeight: 500 }}
                            />
                            {agent.languages.map((lang, index) => (
                              <Chip
                                key={index}
                                label={lang.name}
                                size="small"
                                sx={{
                                  fontWeight: 500,
                                  backgroundColor: 'grey.100',
                                  textTransform: 'capitalize',
                                }}
                              />
                            ))}
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            p: 2,
                            backgroundColor: 'primary.lighter',
                            borderRadius: 1,
                            display: 'flex',
                            gap: 2,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="caption"
                              color="primary.dark"
                              display="block"
                              mb={0.5}
                            >
                              {t('property:details.contact_agent')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                              <Email fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight={500}>
                                {agent.user.email}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 1 }}>
                              <Phone fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight={500}>
                                {agent.user.phone}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyDetails;
