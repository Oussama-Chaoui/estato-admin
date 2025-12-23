import Routes from '@common/defs/routes';
import ItemsTable, { RowAction } from '@common/components/partials/ItemsTable';
import { User } from '@modules/users/defs/types';
import useUsers, { CreateOneInput, UpdateOneInput } from '@modules/users/hooks/api/useUsers';
import { GridColumns } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import Namespaces from '@common/defs/namespaces';
import { CrudRow, CRUD_ACTION } from '@common/defs/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Box, Chip, Stack, Avatar } from '@mui/material';
import { ROLE } from '@modules/permissions/defs/types';
import { Visibility, Person } from '@mui/icons-material';
import { useRouter } from 'next/router';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import namespace from '@modules/users/defs/namespace';

interface Row extends CrudRow {
  name: string;
  photo?: { url: string };
  email: string;
  createdAt: string;
  roles: string[];
}

const getRoleColor = (
  role: string
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (role) {
    case ROLE.ADMIN:
      return 'error';
    case ROLE.AGENT:
      return 'primary';
    case ROLE.CLIENT:
      return 'success';
    default:
      return 'default';
  }
};

const getRoleLabel = (role: string, t: (key: string) => string) => {
  switch (role) {
    case ROLE.ADMIN:
      return t('user:roles.admin') || 'Admin';
    case ROLE.AGENT:
      return t('user:roles.agent') || 'Agent';
    case ROLE.CLIENT:
      return t('user:roles.client') || 'Client';
    default:
      return role;
  }
};

const UsersTable = () => {
  const { t, i18n } = useTranslation(['user']);
  const router = useRouter();
  const { can } = usePermissions();
  const columns: GridColumns<Row> = [
    {
      field: 'userInfo',
      headerName: t('user:list.user_info') || 'User',
      sortable: false,
      filterable: false,
      flex: 1.5,
      renderCell: (params) => {
        const { name, photo } = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Avatar
              src={photo?.url}
              sx={{
                width: 55,
                height: 55,
                bgcolor: photo?.url ? 'transparent' : 'primary.main',
              }}
              imgProps={{
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                },
              }}
            >
              {!photo?.url && <Person sx={{ fontSize: 40 }} />}
            </Avatar>
            <Box>
              <Box sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                {name || t('user:list.no_name') || 'No name'}
              </Box>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
    },
    {
      field: 'email',
      headerName: t('user:list.email'),
      flex: 1,
    },
    {
      field: 'roles',
      headerName: t('user:list.roles'),
      flex: 0.5,
      sortable: false,
      filterable: true,
      renderCell: (params) => {
        const { roles } = params.row;
        return (
          <Box sx={{ py: 1 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {roles.map((role) => (
                <Chip
                  key={role}
                  label={getRoleLabel(role, t)}
                  color={getRoleColor(role)}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Stack>
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: t('user:list.created_at'),
      type: 'dateTime',
      flex: 1,
      renderCell: (params) => dayjs(params.row.createdAt).format('DD/MM/YYYY hh:mm'),
    },
  ];
  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);

  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: User): Row => {
    return {
      id: item.id,
      name: item.name,
      photo: item.photo || undefined,
      email: item.email || '',
      createdAt: item.createdAt,
      roles: item.rolesNames,
    };
  };

  const detailsAction: RowAction<User> = {
    label: t('user:actions.details'),
    icon: <Visibility />,
    onClick: (id) => {
      router.push(Routes.Users.ReadOne.replace('{id}', id.toString()));
    },
    enabled: (id) => {
      return can(namespace, CRUD_ACTION.READ) || can(namespace, CRUD_ACTION.READ, id);
    },
  };

  const actions: RowAction<User>[] = [detailsAction];

  return (
    <>
      <ItemsTable<User, CreateOneInput, UpdateOneInput, Row>
        namespace={Namespaces.Users}
        routes={Routes.Users}
        useItems={useUsers}
        columns={translatedColumns}
        itemToRow={itemToRow}
        showEdit={() => true}
        showDelete={() => true}
        noHeader
        exportable
        search={{
          enabled: true,
          defaultField: 'email',
          fields: [
            { field: 'id', label: 'ID' },
            { field: 'email', label: t('user:list.email') || 'Email' },
          ],
          fieldsFromColumns: false,
          placeholder: t('common:search') || 'Search',
          operator: 'contains',
          debounceMs: 300,
        }}
        sortModel={[{ field: 'createdAt', sort: 'desc' }]}
        density="comfortable"
        actions={actions}
      />
    </>
  );
};

export default UsersTable;
