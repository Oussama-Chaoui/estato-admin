import React from 'react';
import { Box, Typography, Chip, Stack, useTheme } from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CheckCircle,
  Cancel,
  Pending,
  AccessTime,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ItemsTable, { RowAction } from '@common/components/partials/ItemsTable';
import useAgentApplications, {
  CreateOneInput,
  UpdateOneInput,
} from '@modules/agent-applications/hooks/api/useAgentApplications';
import { AgentApplication, AGENT_APPLICATION_STATUS } from '@modules/agent-applications/defs/types';
import Routes from '@modules/agent-applications/defs/routes';
import Namespaces from '@common/defs/namespaces';
import { CRUD_ACTION } from '@common/defs/types';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import { GridColumns } from '@mui/x-data-grid';

interface Row {
  id: number;
  name: string;
  email?: string;
  phone: string;
  status: string;
  createdAt: string;
}

const ApplicationsTable = () => {
  const { t } = useTranslation(['common', 'agent-applications']);
  const { can } = usePermissions();
  const { updateOne } = useAgentApplications();
  const theme = useTheme();
  const namespace = Namespaces.AgentApplications;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case AGENT_APPLICATION_STATUS.PENDING:
        return <Pending sx={{ fontSize: 16 }} />;
      case AGENT_APPLICATION_STATUS.APPROVED:
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case AGENT_APPLICATION_STATUS.REJECTED:
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return <AccessTime sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case AGENT_APPLICATION_STATUS.PENDING:
        return 'warning';
      case AGENT_APPLICATION_STATUS.APPROVED:
        return 'success';
      case AGENT_APPLICATION_STATUS.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColumns = [
    {
      field: 'name',
      headerName: t('agent-applications:table.applicant'),
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.primary.main,
            }}
          >
            <Person sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="600">
              {params.value}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'email',
      headerName: t('common:email'),
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {params.value || t('agent-applications:table.no_email')}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'phone',
      headerName: t('common:primary_phone'),
      flex: 1.2,
      minWidth: 160,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: t('common:status'),
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.value)}
          label={t(`agent-applications:status.${params.value.toLowerCase()}`)}
          color={getStatusColor(params.value)}
          variant="filled"
          sx={{
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            '& .MuiChip-icon': {
              color: 'inherit',
            },
          }}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: t('agent-applications:table.applied'),
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {new Date(params.value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(params.value).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>
      ),
    },
  ];

  const itemToRow = (item: AgentApplication): Row => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    status: item.status,
    createdAt: item.createdAt,
  });

  const approveAction: RowAction<AgentApplication> = {
    label: t('agent-applications:actions.approve'),
    icon: <CheckCircle sx={{ fontSize: 18 }} />,
    onClick: async (id, item, refreshRows) => {
      const response = await updateOne(id, { status: AGENT_APPLICATION_STATUS.APPROVED });
      if (response.success) {
        refreshRows();
      }
    },
    enabled: (id, item) => {
      return (
        item.status !== AGENT_APPLICATION_STATUS.APPROVED && can(namespace, CRUD_ACTION.UPDATE, id)
      );
    },
  };

  const rejectAction: RowAction<AgentApplication> = {
    label: t('agent-applications:actions.reject'),
    icon: <Cancel sx={{ fontSize: 18 }} />,
    onClick: async (id, item, refreshRows) => {
      const response = await updateOne(id, { status: AGENT_APPLICATION_STATUS.REJECTED });
      if (response.success) {
        refreshRows();
      }
    },
    enabled: (id, item) => {
      return (
        item.status !== AGENT_APPLICATION_STATUS.REJECTED && can(namespace, CRUD_ACTION.UPDATE, id)
      );
    },
  };

  const pendingAction: RowAction<AgentApplication> = {
    label: t('agent-applications:actions.mark_as_pending'),
    icon: <Pending sx={{ fontSize: 18 }} />,
    onClick: async (id, item, refreshRows) => {
      const response = await updateOne(id, { status: AGENT_APPLICATION_STATUS.PENDING });
      if (response.success) {
        refreshRows();
      }
    },
    enabled: (id, item) => {
      return (
        item.status !== AGENT_APPLICATION_STATUS.PENDING && can(namespace, CRUD_ACTION.UPDATE, id)
      );
    },
  };

  const actions: RowAction<AgentApplication>[] = [approveAction, rejectAction, pendingAction];

  return (
    <>
      <ItemsTable<AgentApplication, CreateOneInput, UpdateOneInput, Row>
        namespace={namespace}
        routes={Routes}
        useItems={useAgentApplications}
        columns={columns}
        itemToRow={itemToRow}
        showEdit={() => false}
        showDelete={() => false}
        noHeader
        exportable
        search={{
          enabled: true,
          defaultField: 'name',
          fields: [
            { field: 'id', label: 'ID' },
            { field: 'name', label: t('common:name') },
            { field: 'email', label: t('common:email') },
            { field: 'phone', label: t('common:primary_phone') },
            { field: 'status', label: t('common:status') },
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
    </>
  );
};

export default ApplicationsTable;
