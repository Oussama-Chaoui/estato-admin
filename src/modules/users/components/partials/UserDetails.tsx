import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Avatar,
  Divider,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  Badge,
  LocationOn,
  Description,
  CalendarToday,
  Update,
  VerifiedUser,
  Home,
  TrendingUp,
  Hotel,
  Bathtub,
  Apartment,
} from '@mui/icons-material';
import Image from 'next/image';
import { User } from '@modules/users/defs/types';
import { useTranslation } from 'react-i18next';
import { ROLE } from '@modules/permissions/defs/types';
import useRoles from '@modules/roles/hooks/useRoles';
import useProperties from '@modules/properties/hooks/api/useProperties';
import { Property } from '@modules/properties/defs/types';
import { useRouter } from 'next/router';
import Routes from '@common/defs/routes';

interface UserDetailsProps {
  user: User;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  content: string | number;
  fullWidth?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, content, fullWidth = false }) => {
  const { t } = useTranslation(['user']);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: fullWidth ? 3 : 2.5,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(33, 128, 125, 0.12)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '12px',
          bgcolor: 'primary.lighter',
          mr: 2,
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          sx: { color: 'primary.main', fontSize: 24 },
        })}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: '0.75rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '1rem',
            lineHeight: 1.3,
          }}
        >
          {content || t('user:details.not_provided')}
        </Typography>
      </Box>
    </Box>
  );
};

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'grey.200',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        borderColor: 'primary.light',
        boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: 'primary.lighter',
            mr: 2,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            sx: { color: 'primary.main', fontSize: 22 },
          })}
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '1.125rem',
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const { t, i18n } = useTranslation(['user', 'common']);
  const { hasRole } = useRoles();
  const router = useRouter();
  const { readAll } = useProperties();

  console.log('user', user);

  const [agentProperties, setAgentProperties] = useState<Property[] | null>(null);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch agent properties if user is admin and viewing an agent
  useEffect(() => {
    const fetchAgentProperties = async () => {
      if (hasRole(ROLE.ADMIN) && user.agent) {
        setLoadingProperties(true);
        try {
          const filters = [
            {
              filterColumn: 'agents.id',
              filterOperator: 'equals',
              filterValue: user.agent.id.toString(),
            },
          ];

          const response = await readAll(1, 10, undefined, filters);
          if (response.success && response.data?.items) {
            setAgentProperties(response.data.items);
          }
        } catch (error) {
          console.error('Error fetching agent properties:', error);
        } finally {
          setLoadingProperties(false);
        }
      }
    };

    fetchAgentProperties();
  }, [hasRole, user.agent]);

  const handleViewProperty = (propertyId: number) => {
    router.push(Routes.Properties.ReadOne.replace('{id}', propertyId.toString()));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Hero Header Section */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          p: { xs: 3, md: 5 },
          mb: 4,
          background: 'linear-gradient(135deg, #21807D 0%, #1A6664 50%, #134C4B 100%)',
          borderRadius: 1,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user.photo?.url}
                  imgProps={{
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                    },
                  }}
                  sx={{
                    width: { xs: 80, md: 170 },
                    height: { xs: 80, md: 170 },
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    bgcolor: user.photo?.url ? 'transparent' : 'rgba(255,255,255,0.15)',
                    border: '3px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  {!user.photo?.url && getInitials(user.name)}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <VerifiedUser sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  mb: 1,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 3,
                  fontWeight: 400,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                {user.email}
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {user.rolesNames?.map((role) => (
                  <Chip
                    key={role}
                    label={t(`user:roles.${role.toLowerCase()}`)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      height: 36,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.25)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} lg={6}>
          <SectionCard title={t('user:details.contact_info')} icon={<Person />}>
            <Stack spacing={2.5}>
              <InfoItem
                icon={<Email />}
                label={t('user:details.email_address')}
                content={user.email || t('user:details.not_provided')}
              />
              <InfoItem
                icon={<Phone />}
                label={t('user:details.phone_number')}
                content={user.phone || t('user:details.not_provided')}
              />
            </Stack>
          </SectionCard>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} lg={6}>
          <SectionCard title={t('user:details.system_info')} icon={<VerifiedUser />}>
            <Stack spacing={2.5}>
              <InfoItem
                icon={<CalendarToday />}
                label={t('user:details.member_since')}
                content={new Date(user.createdAt).toLocaleDateString(i18n.language, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
              <InfoItem
                icon={<Update />}
                label={t('user:details.last_updated')}
                content={new Date(user.updatedAt).toLocaleDateString(i18n.language, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
            </Stack>
          </SectionCard>
        </Grid>

        {/* Agent Information */}
        {user.agent && (
          <Grid item xs={12}>
            <SectionCard title={t('user:details.agent_info')} icon={<Business />}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={4}>
                  <InfoItem
                    icon={<Badge />}
                    label={t('user:details.license_number')}
                    content={user.agent.licenceNumber || t('user:details.not_provided')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <InfoItem
                    icon={<TrendingUp />}
                    label={t('user:details.experience')}
                    content={`${user.agent.experience} ${t('user:details.years')}`}
                  />
                </Grid>
                <Grid item xs={12} sm={12} lg={4}>
                  <InfoItem
                    icon={<Business />}
                    label={t('user:details.agency_name')}
                    content={user.agent.agencyName}
                  />
                </Grid>
                <Grid item xs={12} sm={12} lg={12}>
                  <InfoItem
                    icon={<LocationOn />}
                    label={t('user:details.agency_address')}
                    content={user.agent.agencyAddress}
                  />
                </Grid>

                {user.agent.bio && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2, borderColor: 'grey.200' }} />
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: 'primary.lighter',
                            mr: 1.5,
                          }}
                        >
                          <Description sx={{ color: 'primary.main', fontSize: 18 }} />
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                          }}
                        >
                          {t('user:details.about')}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.7,
                          color: 'text.secondary',
                          fontSize: '0.95rem',
                        }}
                      >
                        {user.agent.bio}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </SectionCard>
          </Grid>
        )}

        {/* Client Information */}
        {user.client && (
          <Grid item xs={12}>
            <SectionCard title={t('user:details.client_info')} icon={<Person />}>
              <Grid container spacing={3}>
                {user.client.nicNumber && (
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={<Badge />}
                      label={t('user:details.nic_number')}
                      content={user.client.nicNumber}
                    />
                  </Grid>
                )}
                {user.client.passport && (
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={<Badge />}
                      label={t('user:details.passport')}
                      content={user.client.passport}
                    />
                  </Grid>
                )}
              </Grid>
            </SectionCard>
          </Grid>
        )}

        {/* Agent Properties - Only visible to admins */}
        {hasRole(ROLE.ADMIN) && user.agent && (
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 12px 40px rgba(33, 128, 125, 0.15)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'primary.lighter',
                      mr: 2,
                    }}
                  >
                    <Home sx={{ color: 'primary.main', fontSize: 20 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {t('user:details.properties_portfolio')} ({agentProperties?.length || 0})
                  </Typography>
                </Box>
                {loadingProperties && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'primary.lighter',
                        mb: 2,
                      }}
                    >
                      <Home sx={{ color: 'primary.main', fontSize: 24 }} />
                    </Box>
                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                      {t('user:details.loading_properties')}
                    </Typography>
                  </Box>
                )}

                {!loadingProperties && agentProperties && agentProperties.length > 0 && (
                  <Grid container spacing={3}>
                    {agentProperties.map((property, index) => (
                      <Grid item xs={12} sm={6} lg={4} key={`property-${property.id}-${index}`}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'grey.100',
                            transition: 'all 0.3s ease-in-out',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            bgcolor: 'background.paper',
                            '&:hover': {
                              borderColor: 'primary.main',
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                            },
                          }}
                          onClick={() => handleViewProperty(property.id)}
                        >
                          {/* Property Image */}
                          <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                            {property.images && property.images.length > 0 ? (
                              <Image
                                src={property.images[0].upload.url}
                                alt={
                                  property.title?.en ||
                                  property.title?.fr ||
                                  t('user:details.untitled_property')
                                }
                                fill
                                style={{
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  bgcolor: 'grey.100',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Home sx={{ fontSize: 32, color: 'text.secondary' }} />
                              </Box>
                            )}

                            {/* Gradient Overlay */}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '40%',
                                background:
                                  'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                              }}
                            />

                            {/* Property Type Badge */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                zIndex: 2,
                              }}
                            >
                              <Chip
                                label={property.type}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  color: 'text.primary',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  backdropFilter: 'blur(10px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                              />
                            </Box>

                            {/* Status Indicator */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                zIndex: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor:
                                    property.status === 'FOR_SALE'
                                      ? 'success.main'
                                      : 'warning.main',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                }}
                              />
                            </Box>
                          </Box>

                          <CardContent sx={{ p: 2 }}>
                            {/* Property Title */}
                            <Tooltip
                              title={
                                property.title?.en ||
                                property.title?.fr ||
                                t('user:details.untitled_property')
                              }
                              placement="top"
                              arrow
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  lineHeight: 1.3,
                                  color: 'text.primary',
                                  fontSize: '0.95rem',
                                  mb: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {property.title?.en ||
                                  property.title?.fr ||
                                  t('user:details.untitled_property')}
                              </Typography>
                            </Tooltip>

                            {/* Location */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <LocationOn sx={{ fontSize: 14, color: 'primary.main', mr: 0.5 }} />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontSize="0.8rem"
                                fontWeight={500}
                              >
                                {property.location?.city?.names?.en ||
                                  property.location?.city?.names?.fr ||
                                  t('user:details.location_not_specified')}
                              </Typography>
                            </Box>

                            {/* Property Features */}
                            {property.features && property.features.length > 0 && (
                              <Box sx={{ mb: 1.5 }}>
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                  {property.features[0].bedrooms > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Box
                                        sx={{
                                          p: 0.5,
                                          bgcolor: 'primary.50',
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Hotel sx={{ fontSize: 14, color: 'primary.main' }} />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                        fontSize="0.8rem"
                                        fontWeight={600}
                                      >
                                        {property.features[0].bedrooms}
                                      </Typography>
                                    </Box>
                                  )}
                                  {property.features[0].bathrooms > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Box
                                        sx={{
                                          p: 0.5,
                                          bgcolor: 'primary.50',
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Bathtub sx={{ fontSize: 14, color: 'primary.main' }} />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                        fontSize="0.8rem"
                                        fontWeight={600}
                                      >
                                        {property.features[0].bathrooms}
                                      </Typography>
                                    </Box>
                                  )}
                                  {property.features[0].area > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Box
                                        sx={{
                                          p: 0.5,
                                          bgcolor: 'primary.50',
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Apartment sx={{ fontSize: 14, color: 'primary.main' }} />
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                        fontSize="0.8rem"
                                        fontWeight={600}
                                      >
                                        {property.features[0].area}m²
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Pricing Section */}
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: 'grey.50',
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'grey.200',
                              }}
                            >
                              {property.salePrice && property.salePrice > 0 && (
                                <Box
                                  sx={{ mb: property.monthlyPrice || property.dailyPrice ? 1 : 0 }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    fontSize="0.65rem"
                                    mb={0.5}
                                  >
                                    {t('user:details.sale_price')}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 700,
                                      color: 'success.main',
                                      fontSize: '1rem',
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {property.salePrice.toLocaleString()} MAD
                                  </Typography>
                                </Box>
                              )}

                              {property.monthlyPrice && property.monthlyPrice > 0 && (
                                <Box sx={{ mb: property.dailyPrice ? 1 : 0 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    fontSize="0.65rem"
                                    mb={0.5}
                                  >
                                    {t('user:details.monthly_rent')}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: 'primary.main',
                                      fontSize: '0.85rem',
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {property.monthlyPrice.toLocaleString()} MAD/month
                                  </Typography>
                                </Box>
                              )}

                              {property.dailyPrice && property.dailyPrice > 0 && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    fontSize="0.65rem"
                                    mb={0.5}
                                  >
                                    {t('user:details.daily_rate')}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: 'warning.main',
                                      fontSize: '0.85rem',
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {property.dailyPrice.toLocaleString()} MAD/day
                                  </Typography>
                                </Box>
                              )}

                              {(!property.salePrice || property.salePrice === 0) &&
                                (!property.monthlyPrice || property.monthlyPrice === 0) &&
                                (!property.dailyPrice || property.dailyPrice === 0) && (
                                  <Box sx={{ textAlign: 'center', py: 0.5 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        fontSize: '0.8rem',
                                      }}
                                    >
                                      {t('user:details.price_not_available')}
                                    </Typography>
                                  </Box>
                                )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {!loadingProperties && (!agentProperties || agentProperties.length === 0) && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'grey.100',
                        mb: 3,
                      }}
                    >
                      <Home sx={{ fontSize: 36, color: 'text.secondary' }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {t('user:details.no_properties_found')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {t('user:details.no_properties_message')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UserDetails;
