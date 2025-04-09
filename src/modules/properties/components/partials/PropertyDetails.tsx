import {
  Apartment,
  Bathtub,
  Bed,
  CalendarToday,
  CheckCircle,
  Edit,
  Delete,
  History,
  LocationOn,
  SquareFoot,
  VerifiedUser,
  Report,
  LockClock,
  AdminPanelSettings,
  GpsFixed,
  OpenInNew,
  Email,
  Phone,
  Business,
  PeopleAlt,
  Send,
  Star,
  Visibility
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
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Stack,
  CardMedia
} from '@mui/material';
import { Property } from '@modules/properties/defs/types';
import { Agent } from '@modules/users/defs/types';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  // Organizing technical details (excluding location/coordinates since that will be separate)
  const technicalDetails = [
    {
      icon: <Apartment />,
      label: `Type`,
      value: property.type.replace('_', ' ')
    },
    {
      icon: <CalendarToday />,
      label: `Year Built`,
      value: property.yearBuilt
    },
    {
      icon: <SquareFoot />,
      label: `Lot Size`,
      value: `${property.lotSize} sqm`
    },
    {
      icon: <LockClock />,
      label: `Created At`,
      value: new Date(property.createdAt).toLocaleString()
    }
  ];

  // Create Google Maps embed URL using latitude and longitude
  const mapUrl = `https://maps.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`;

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        {/* Admin Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <AdminPanelSettings color="primary" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {property.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={property.status.replace('_', ' ')}
                color={
                  property.status === 'for_sale'
                    ? 'success'
                    : property.status === 'sold'
                      ? 'error'
                      : 'warning'
                }
                variant="filled"
                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
              />
              <Chip
                label={`ID: ${property.id}`}
                variant="outlined"
                color="info"
                size="small"
              />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
              {Number(property.price).toLocaleString()} {property.currency}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last Updated: {new Date(property.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Admin Quick Actions */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            color="primary"
            onClick={() => console.log('Edit property')}
          >
            Edit Property
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            color="error"
            onClick={() => console.log('Delete property')}
          >
            Delete Property
          </Button>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => console.log('View history')}
          >
            View Activity Log
          </Button>
          <Button
            variant="outlined"
            startIcon={<VerifiedUser />}
            onClick={() => console.log('Verify property')}
          >
            Verify Ownership
          </Button>
        </Box>

        {/* Technical Details Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {technicalDetails.map((detail, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%'
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

        {/* Location Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <LocationOn fontSize="medium" color="primary" />
            Property Location
          </Typography>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {property.location.city}, {property.location.region}
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
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={mapUrl}
                  title="Property Location Map"
                  style={{
                    border: 0,
                    filter: 'grayscale(20%)'
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
                    boxShadow: 'inset 0 0 16px rgba(0,0,0,0.08)'
                  }}
                />
              </Box>
            </Box>
          </Card>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Management Sections */}
        <Grid container spacing={4}>
          {/* Amenities Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Amenities Management
              </Typography>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Grid container spacing={1}>
                  {property.amenities.map((amenity, index) => (
                    <Grid item xs="auto" key={index}>
                      <Chip
                        label={amenity.name}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Total amenities: {property.amenities.length}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Agents Details Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: 'text.primary',
          }}>
            <PeopleAlt color="primary" fontSize="medium" />
            Associated Agents
          </Typography>

          <Grid container spacing={4}>
            {property.agents.map((agent: Agent) => (
              <Grid item xs={12} md={6} key={agent.id}>
                <Card sx={{
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  },
                  height: '100%',
                  position: 'relative' // Added for absolute positioning
                }}>
                  {/* View Agent Button - Top Right Corner */}
                  <Tooltip title="View Full Agent Listing">
                    <IconButton
                      onClick={() => console.log(`View agent ${agent.id}`)}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText'
                        },
                        zIndex: 1,
                        boxShadow: 1
                      }}
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      gap: 3,
                      alignItems: 'flex-start',
                      position: 'relative'
                    }}>
                      {/* Agent Avatar with Badge */}
                      <Box sx={{ position: 'relative' }}>
                        {agent.photo ? (
                          <CardMedia
                            component="img"
                            src={agent.photo}
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: 2,
                              objectFit: 'cover',
                              border: '3px solid',
                              borderColor: 'primary.light'
                            }}
                            alt={agent.user.name}
                          />
                        ) : (
                          <Avatar sx={{
                            width: 120,
                            height: 120,
                            bgcolor: 'primary.main',
                            fontSize: 40,
                            border: '3px solid',
                            borderColor: 'primary.light'
                          }}>
                            {agent.user.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                        )}
                        <Box sx={{
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
                          border: '2px solid white'
                        }}>
                          <VerifiedUser fontSize="small" />
                        </Box>
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        {/* Agent Header */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" fontWeight={700} sx={{
                            color: 'primary.dark',
                            mb: 0.5
                          }}>
                            {agent.user.name}
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexWrap: 'wrap'
                          }}>
                            <Chip
                              label={agent.licenceNumber}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}>
                              <Star fontSize="small" color="warning" />
                              <Typography variant="caption" color="text.secondary">
                                5.0 (24 reviews)
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Agency Info */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          mb: 2,
                          p: 1.5,
                          backgroundColor: 'grey.50',
                          borderRadius: 2
                        }}>
                          <Business color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {agent.agancyName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {agent.agencyAddress}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Experience and Languages */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            SPECIALTIES
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={`${agent.experience}+ years experience`}
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
                                  textTransform: 'capitalize'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>

                        {/* Contact Info */}
                        <Box sx={{
                          p: 2,
                          backgroundColor: 'primary.lighter',
                          borderRadius: 2,
                          display: 'flex',
                          gap: 2,
                          flexWrap: 'wrap'
                        }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption" color="primary.dark" display="block" mb={0.5}>
                              CONTACT AGENT
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

        {/* Audit Section */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Audit Trail
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created By
              </Typography>
              <Typography variant="body2">System Admin</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last Modified
              </Typography>
              <Typography variant="body2">
                {new Date(property.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyDetails;
