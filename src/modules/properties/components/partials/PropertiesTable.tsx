import Routes from '@common/defs/routes';
import ItemsTable, { RowAction } from '@common/components/partials/ItemsTable';
import { Any, CRUD_ACTION, CrudRow } from '@common/defs/types';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import Namespaces from '@common/defs/namespaces';
import { useTranslation } from 'react-i18next';
import { getTranslatedText } from '@common/utils/translations';
import { useEffect, useState } from 'react';
import { Property, PROPERTY_STATUS, PROPERTY_TYPE } from '@modules/properties/defs/types';
import useProperties, {
  CreateOneInput,
  UpdateOneInput,
} from '@modules/properties/hooks/api/useProperties';
import { Chip, Stack, Tooltip, useTheme, Box, Typography, Avatar } from '@mui/material';
import {
  Public,
  Phone,
  EmailOutlined,
  Place,
  LocalOffer,
  CalendarToday,
  AccessTime,
  Visibility,
  Apartment,
  House,
  Villa,
  Business,
  DirectionsCar,
  Home,
  Landscape,
  CalendarMonth,
} from '@mui/icons-material';
import { Language } from '@modules/users/defs/types';
import { useRouter } from 'next/router';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import namespace from '@modules/properties/defs/namespace';
import { Agent } from '@modules/agents/defs/types';
import Image from 'next/image';
import PropertyRentalManagementModal from './PropertyRentalManagementModal';

interface Row extends CrudRow {
  title: string;
  streetAddress: string;
  salePrice: number;
  monthlyPrice: number;
  dailyPrice: number;
  currency: string;
  status: PROPERTY_STATUS;
  monthlyPriceEnabled: boolean;
  dailyPriceEnabled: boolean;
  createdAt: string;
  location: {
    city: string;
    [key: string]: Any;
  };
  type: PROPERTY_TYPE;
  agents: Agent[];
  amenities: Any[];
  images: Any[];
  features: Any;
  rentals: Any[];
}

const getPropertyTypeIcon = (type: PROPERTY_TYPE) => {
  switch (type) {
    case PROPERTY_TYPE.HOUSE:
      return <House fontSize="small" />;
    case PROPERTY_TYPE.APARTMENT:
      return <Apartment fontSize="small" />;
    case PROPERTY_TYPE.VILLA:
      return <Villa fontSize="small" />;
    case PROPERTY_TYPE.STUDIO:
      return <Home fontSize="small" />;
    case PROPERTY_TYPE.COMMERCIAL:
      return <Business fontSize="small" />;
    case PROPERTY_TYPE.OFFICE:
      return <Business fontSize="small" />;
    case PROPERTY_TYPE.GARAGE:
      return <DirectionsCar fontSize="small" />;
    case PROPERTY_TYPE.MANSION:
      return <Villa fontSize="small" />;
    case PROPERTY_TYPE.LAND:
      return <Landscape fontSize="small" />;
    default:
      return <Home fontSize="small" />;
  }
};

const isPropertyCurrentlyRented = (rentals: Any[] = []) => {
  const now = new Date();
  return rentals.some((rental) => {
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    return now >= startDate && now <= endDate;
  });
};

const PropertiesTable = () => {
  const { t, i18n } = useTranslation(['property']);

  const getPropertyTypeLabel = (type: PROPERTY_TYPE) => {
    const typeKey = type.toLowerCase();
    return t(`property:types.${typeKey}`) || type.replace('_', ' ');
  };
  const theme = useTheme();
  const router = useRouter();
  const { can } = usePermissions();
  const [rentalManagementOpen, setRentalManagementOpen] = useState(false);
  const [rentalManagementProperty, setRentalManagementProperty] = useState<Property | null>(null);

  const columns: GridColumns<Row> = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
    },
    {
      field: 'location.city',
      headerName: t('property:list.city'),
      width: 120,
      hide: true,
      filterable: true,
      sortable: false,
    },
    {
      field: 'image',
      headerName: t('property:list.property_image'),
      width: 300,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const firstImage = params.row.images?.[0];
        const imageUrl = firstImage?.upload?.url || '/images/placeholder-property.jpg';

        return (
          <Box
            sx={{
              position: 'relative',
              width: 300,
              height: 180,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Image
              src={imageUrl}
              alt={params.row.title}
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-property.jpg';
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'title',
      headerName: t('property:list.title') || 'Property',
      flex: 2,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Box sx={{ width: '100%', py: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 0.5,
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={() => {
              router.push(Routes.Properties.ReadOne.replace('{id}', params.row.id.toString()));
            }}
          >
            {params.value}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            {getPropertyTypeIcon(params.row.type)}
            <Chip
              label={getPropertyTypeLabel(params.row.type)}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                fontWeight: 600,
                textTransform: 'capitalize',
                fontSize: '0.7rem',
              }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Place fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {params.row.location?.city || t('property:list.unknown_location')}
            </Typography>
          </Stack>
        </Box>
      ),
    },

    {
      field: 'pricing',
      headerName: t('property:list.pricing') || 'Pricing',
      flex: 1.5,
      sortable: false,
      minWidth: 200,
      renderCell: (params) => {
        const {
          salePrice,
          monthlyPrice,
          dailyPrice,
          currency,
          monthlyPriceEnabled,
          dailyPriceEnabled,
          status,
        } = params.row;

        const isSoldOrRented = status === PROPERTY_STATUS.SOLD || status === PROPERTY_STATUS.RENTED;

        return (
          <Box sx={{ py: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LocalOffer fontSize="small" color="primary" />
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  color: isSoldOrRented ? 'text.disabled' : 'text.primary',
                  textDecoration: isSoldOrRented ? 'line-through' : 'none',
                }}
              >
                {salePrice.toLocaleString()} {currency}
              </Typography>
            </Stack>

            {monthlyPriceEnabled && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <CalendarToday fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  {monthlyPrice.toLocaleString()} {currency}/mo
                </Typography>
              </Stack>
            )}

            {dailyPriceEnabled && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  {dailyPrice.toLocaleString()} {currency}/day
                </Typography>
              </Stack>
            )}
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: t('property:list.status') || 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const { status, rentals } = params.row;
        const isCurrentlyRented = isPropertyCurrentlyRented(rentals);

        if (status === PROPERTY_STATUS.SOLD) {
          return (
            <Box sx={{ py: 1 }}>
              <Chip
                label={t('property:status.sold')}
                color="error"
                size="small"
                sx={{
                  fontWeight: 700,
                  borderRadius: 1,
                }}
              />
            </Box>
          );
        }

        if (status === PROPERTY_STATUS.RENTED) {
          return (
            <Box sx={{ py: 1 }}>
              <Chip
                label={t('property:status.rented')}
                color="error"
                size="small"
                sx={{
                  fontWeight: 700,
                  borderRadius: 1,
                }}
              />
            </Box>
          );
        }

        if (isCurrentlyRented) {
          return (
            <Box sx={{ py: 1 }}>
              <Chip
                label={t('property:status.currently_rented')}
                color="warning"
                size="small"
                sx={{
                  fontWeight: 700,
                  borderRadius: 1,
                }}
              />
            </Box>
          );
        }

        return (
          <Box sx={{ py: 1 }}>
            <Chip
              label={t('property:status.available')}
              color="success"
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: 1,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'agents',
      headerName: t('property:list.agents') || 'Agents',
      flex: 1.2,
      sortable: false,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          {params.row.agents?.map((agent, index) => (
            <Tooltip
              key={index}
              title={
                <Box sx={{ p: 2, textAlign: 'left', minWidth: 280 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: theme.shadows[2],
                      }}
                    >
                      {agent.user.name
                        .split(' ')
                        .slice(0, 2)
                        .map((n: string) => n.charAt(0))
                        .join('')
                        .toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ color: 'text.primary', mb: 0.5 }}
                      >
                        {agent.user.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          fontSize: '0.75rem',
                        }}
                      >
                        {agent.agencyName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      mb: 2,
                      p: 1.5,
                      backgroundColor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          color: 'white',
                        }}
                      >
                        <Phone sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {agent.user.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'info.main',
                          color: 'white',
                        }}
                      >
                        <EmailOutlined sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={500} color="text.primary">
                        {agent.user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'warning.main',
                        color: 'white',
                      }}
                    >
                      <Public sx={{ fontSize: 14 }} />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ mr: 1 }}
                      color="text.primary"
                    >
                      {t('property:agent_tooltip.languages')}:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {agent.languages.map((lang: Language) => (
                        <Chip
                          key={lang.id}
                          label={lang.name.slice(0, 2).toUpperCase()}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}
                        />
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
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: theme.shadows[8],
                    borderRadius: 2,
                    maxWidth: 320,
                    '& .MuiTooltip-arrow': {
                      color: 'background.paper',
                    },
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
      field: 'createdAt',
      headerName: t('property:list.created_at'),
      width: 120,
      hide: true,
      sortable: false,
    },
  ];

  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);

  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: Property): Row => ({
    id: item.id,
    title: getTranslatedText(item.title, i18n.language, t('property:list.untitled')),
    streetAddress: item.streetAddress,
    salePrice: Number(item.salePrice),
    monthlyPrice: Number(item.monthlyPrice),
    dailyPrice: Number(item.dailyPrice),
    currency: item.currency,
    status: item.status,
    type: item.type,
    monthlyPriceEnabled: item.monthlyPriceEnabled,
    dailyPriceEnabled: item.dailyPriceEnabled,
    createdAt: item.createdAt,
    location: {
      city: getTranslatedText(
        item.location?.city?.names,
        i18n.language,
        t('property:list.unknown_location')
      ),
    },
    agents: item.agents,
    amenities: item.amenities,
    images: item.images,
    features: item.features,
    rentals: item.rental || [],
  });

  const detailsAction: RowAction<Property> = {
    label: t('property:actions.details'),
    icon: <Visibility />,
    onClick: (id) => {
      router.push(Routes.Properties.ReadOne.replace('{id}', id.toString()));
    },
    enabled: (id) => {
      return can(namespace, CRUD_ACTION.READ) || can(namespace, CRUD_ACTION.READ, id);
    },
  };

  const actions: RowAction<Property>[] = [detailsAction];

  const manageBookingsAction: RowAction<Property> = {
    label: t('property:actions.bookings'),
    icon: <CalendarMonth />,
    onClick: (_id, item) => {
      setRentalManagementProperty(item);
      setRentalManagementOpen(true);
    },
    enabled: () => true,
  };

  actions.push(manageBookingsAction);

  return (
    <>
      <ItemsTable<Property, CreateOneInput, UpdateOneInput, Row>
        namespace={Namespaces.Properties}
        routes={Routes.Properties}
        useItems={useProperties}
        columns={translatedColumns}
        itemToRow={itemToRow}
        showEdit={() => true}
        showDelete={() => true}
        getRowHeight={() => 200}
        noHeader
        exportable
        search={{
          enabled: true,
          defaultField: 'id',
          fields: [
            { field: 'id', label: 'ID' },
            { field: 'title', label: t('property:list.title') || 'Title' },
            { field: 'location.city', label: t('property:list.city') },
          ],
          fieldsFromColumns: false,
          placeholder: t('common:search') || 'Search',
          operator: 'contains',
          debounceMs: 300,
        }}
        sortModel={[{ field: 'createdAt', sort: 'desc' }]}
        actions={actions}
        density="comfortable"
      />
      {rentalManagementOpen && rentalManagementProperty && (
        <PropertyRentalManagementModal
          open={rentalManagementOpen}
          onClose={() => {
            setRentalManagementOpen(false);
            setRentalManagementProperty(null);
          }}
          property={rentalManagementProperty}
        />
      )}
    </>
  );
};

export default PropertiesTable;
