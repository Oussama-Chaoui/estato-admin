import Routes from '@common/defs/routes';
import ItemsTable from '@common/components/partials/ItemsTable';
import { CrudRow } from '@common/defs/types';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import Namespaces from '@common/defs/namespaces';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Property, PROPERTY_STATUS, PROPERTY_TYPE } from '@modules/properties/defs/types';
import useProperties, { CreateOneInput, UpdateOneInput } from '@modules/properties/hooks/api/useProperties';
import { Chip, Stack, Tooltip, useTheme, Box, Typography } from '@mui/material';
import {
  KeyboardDoubleArrowUp,
  KeyboardDoubleArrowDown,
  InfoOutlined,
  Public,
  Phone,
  EmailOutlined,
  Place,
  AttachMoney,
  CircleNotifications,
  Category,
  LocalOfferOutlined,
  LocalOffer
} from '@mui/icons-material';
import { Agent, Language } from '@modules/users/defs/types';
import PropertyStatus from './PropertyStatus';

interface Row extends CrudRow {
  title: string;
  streetAddress: string;
  price: number;
  currency: string;
  status: PROPERTY_STATUS;
  createdAt: string;
  location: {
    city: string;
    [key: string]: any;
  };
  type: PROPERTY_TYPE;
  agents: Agent[];
  amenities: any[];
}

const statusColors = {
  for_sale: 'success',
  rented: 'warning',
  pending: 'info',
  sold: 'error'
};

const PropertiesTable = () => {
  const { t, i18n } = useTranslation(['property']);
  const theme = useTheme();

  const columns: GridColumns<Row> = [
    {
      field: 'title',
      headerName: t('property:list.title'),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <strong>{params.value}</strong>
        </Stack>
      ),
    },
    {
      field: 'details',
      headerName: t('property:list.details'),
      flex: 1.2,
      minWidth: 100,
      renderCell: (params) => {
        const locationValue = {
          city: params.row.location?.city || '',
          address: params.row.streetAddress || ''
        };

        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              width: '100%',
              py: 1.5,
            }}
          >
            {/* Property Type with Icon */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Category fontSize="small" color="primary" />
              <Chip
                label={params.row.type}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              />
            </Stack>

            {/* Status with Icon */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CircleNotifications fontSize="small" color="primary" />
              <PropertyStatus status={params.row.status} />
            </Stack>

            {/* Price with Icon */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <LocalOffer fontSize="small" color="primary" />
              <Chip
                label={`${Number(params.row.price).toLocaleString()} ${params.row.currency}`}
                size="small"
                sx={{
                  backgroundColor: 'primary.light',
                  borderRadius: 16,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: 'secondary.dark',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[1],
                    backgroundColor: 'primary.main',
                  },
                }}
              />
            </Stack>

            {/* Location with Icon and Tooltip */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Place fontSize="small" color="primary" />
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {locationValue.address}
                </Typography>
              </Box>
            </Stack>

          </Box>
        );
      },
    },
    {
      field: 'agents',
      headerName: t('property:list.agents'),
      flex: 1.1,
      minWidth: 150,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
            py: 1, // Add some vertical padding
            width: '100%',
          }}
        >
          {params.row.agents?.map((agent, index) => (
            <Tooltip
              key={index}
              title={
                <Box sx={{ p: 1.5, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.primary',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      {agent.user.name
                        .split(' ')
                        .slice(0, 2)
                        .map((n: string) => n.charAt(0))
                        .join('')
                        .toUpperCase()}
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {agent.user.name}
                      </Typography>
                      <Typography variant="caption">{agent.agancyName}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gap: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Phone fontSize="small" />
                      <Typography variant="body2">{agent.user.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <EmailOutlined fontSize="small" />
                      <Typography variant="body2">{agent.user.email}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Public fontSize="small" />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {agent.languages.map((lang: Language) => (
                        <Box
                          key={lang.id}
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                            {lang.name.slice(0, 2).toUpperCase()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              }
              arrow
              placement="top"
              componentsProps={{
                tooltip: {
                  sx: {
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 2,
                    maxWidth: 300,
                  },
                },
                arrow: {
                  sx: {
                    '&:before': {
                      border: '1px solid',
                      borderColor: 'divider',
                    },
                  },
                },
              }}
            >
              <Chip
                label={agent.licenceNumber}
                size="small"
                variant="outlined"
                sx={{
                  backgroundColor: 'primary.light',
                  borderColor: 'divider',
                  borderRadius: 16,
                  transition: 'all 0.2s ease',
                  color: 'secondary.dark',
                  fontWeight: 600,
                  p: 1.5,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[1],
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.main',
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      ),
    },

    {
      field: 'amenities',
      headerName: t('property:list.amenities'),
      flex: 1.2,
      minWidth: 300,
      renderCell: (params) => {
        const theme = useTheme();
        const [expanded, setExpanded] = useState(false);
        const amenities = params.row.amenities || [];
        const maxVisible = 6;
        const visibleAmenities = expanded ? amenities : amenities.slice(0, maxVisible);
        const hasOverflow = amenities.length > maxVisible;

        return (
          <Box
            sx={{
              p: 2,
              width: '100%',
              position: 'relative',
              minHeight: 64,
              '&:hover .toggle-indicator': {
                opacity: 1,
              },
            }}
          >
            {/* Amenities Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, 120px)',
                justifyContent: 'space-evenly',
                gap: 1,
                marginBottom: hasOverflow ? 1 : 0,
              }}
            >
              {visibleAmenities.map((amenity, index) => (
                <Tooltip key={index} title={amenity.name} arrow>
                  <Chip
                    label={amenity.name}
                    size="medium"
                    sx={{
                      width: '100%',
                      maxWidth: 120,
                      borderRadius: 1,
                      transition: 'all 0.2s',
                      bgcolor: theme.palette.primary.light,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.secondary.dark,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: theme.shadows[1],
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.main',
                      },
                      '& .MuiChip-label': {
                        px: 1.5,
                        py: 0.5,
                        fontWeight: 600,
                      },
                    }}
                    variant="outlined"
                  />
                </Tooltip>
              ))}
            </Box>

            {/* Subtle Toggle Indicator */}
            {hasOverflow && (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  cursor: 'pointer',
                  opacity: 0.6,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    opacity: 1,
                    transform: 'translateX(-50%) scale(1.1)',
                  },
                }}
                className="toggle-indicator"
              >
                {expanded ? (
                  <KeyboardDoubleArrowUp
                    sx={{
                      fontSize: '1rem',
                      color: theme.palette.text.secondary,
                    }}
                  />
                ) : (
                  <KeyboardDoubleArrowDown
                    sx={{
                      fontSize: '1rem',
                      color: theme.palette.text.secondary,
                    }}
                  />
                )}
              </Box>
            )}

            {/* Empty State */}
            {amenities.length === 0 && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  fontStyle: 'italic',
                  opacity: 0.8,
                }}
              >
                {t('property:list.noAmenities')}
              </Typography>
            )}
          </Box>
        );
      },
    }

  ];

  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);

  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: Property): Row => ({
    id: item.id,
    title: item.title,
    streetAddress: item.streetAddress,
    price: Number(item.price),
    currency: item.currency,
    status: item.status,
    type: item.type,
    createdAt: item.createdAt,
    location: item.location,
    agents: item.agents,
    amenities: item.amenities,
  });

  return (

    <ItemsTable<Property, CreateOneInput, UpdateOneInput, Row>
      namespace={Namespaces.Properties}
      routes={Routes.Properties}
      useItems={useProperties}
      columns={translatedColumns}
      itemToRow={itemToRow}
      showEdit={() => true}
      showDelete={() => true}
      getRowHeight={() => 'auto'}
      exportable
    />
  );
};

export default PropertiesTable;