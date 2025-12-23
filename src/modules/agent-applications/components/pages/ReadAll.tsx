import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack, Divider, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Assignment,
  Person,
  Email,
  Phone,
  CheckCircle,
  Cancel,
  Pending,
  AccessTime,
} from '@mui/icons-material';
import ItemsTable from '@common/components/partials/ItemsTable';
import useAgentApplications, {
  CreateOneInput,
  UpdateOneInput,
} from '@modules/agent-applications/hooks/api/useAgentApplications';
import { AgentApplication } from '@modules/agent-applications/defs/types';
import { CrudRow } from '@common/defs/types';
import Routes from '@modules/agent-applications/defs/routes';
import Namespaces from '@common/defs/namespaces';

interface Row extends CrudRow {
  name: string;
  email?: string;
  phone: string;
  status: string;
  createdAt: string;
}

const ApplicationsTable = () => {
  const theme = useTheme();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Pending sx={{ fontSize: 16 }} />;
      case 'APPROVED':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'REJECTED':
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return <AccessTime sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const itemToRow = (item: AgentApplication): Row => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    status: item.status,
    createdAt: item.createdAt,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
            }}
          >
            <Assignment sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Agent Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and review agent applications
            </Typography>
          </Box>
        </Stack>
        <Divider />
      </Box>

      {/* Applications Table */}
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <ItemsTable<AgentApplication, CreateOneInput, UpdateOneInput, Row>
            namespace={Namespaces.AgentApplications}
            routes={Routes}
            useItems={useAgentApplications}
            columns={[
              {
                field: 'name',
                headerName: 'Applicant',
                flex: 1.5,
                minWidth: 200,
                renderCell: (params) => (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
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
                headerName: 'Contact',
                flex: 1.2,
                minWidth: 220,
                renderCell: (params) => (
                  <Box>
                    {params.row.email && (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {params.row.email}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="medium">
                        {params.row.phone}
                      </Typography>
                    </Stack>
                  </Box>
                ),
              },
              {
                field: 'status',
                headerName: 'Status',
                flex: 0.8,
                minWidth: 140,
                renderCell: (params) => (
                  <Chip
                    icon={getStatusIcon(params.value)}
                    label={params.value}
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
                headerName: 'Applied',
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
            ]}
            itemToRow={itemToRow}
            showEdit={() => false}
            showDelete={() => false}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApplicationsTable;
