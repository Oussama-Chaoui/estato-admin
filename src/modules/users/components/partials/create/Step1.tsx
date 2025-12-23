import {
  FormStepProps,
  FormStepRef,
  StepComponent,
} from '@common/components/lib/navigation/FormStepper';
import { ROLE } from '@modules/permissions/defs/types';
import { Card, CardContent, Typography, Box, Chip, Alert, Stack } from '@mui/material';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { Check } from '@mui/icons-material';

const CreateUserStep1 = forwardRef<FormStepRef, FormStepProps>(({ next, data }, ref) => {
  const { t } = useTranslation(['user', 'common']);
  const [selectedRoles, setSelectedRoles] = useState<ROLE[]>(() => {
    if (data?.roles && Array.isArray(data.roles)) {
      return data.roles;
    }
    if (data?.role) {
      return [data.role];
    }
    return [ROLE.ADMIN];
  });

  const handleRoleToggle = (role: ROLE) => {
    let newRoles: ROLE[];

    if (selectedRoles.includes(role)) {
      newRoles = selectedRoles.filter((r) => r !== role);
    } else if (role === ROLE.CLIENT) {
      newRoles = [ROLE.CLIENT];
    } else if (role === ROLE.ADMIN) {
      newRoles = selectedRoles.filter((r) => r !== ROLE.CLIENT);
      newRoles.push(ROLE.ADMIN);
    } else if (role === ROLE.AGENT) {
      newRoles = selectedRoles.filter((r) => r !== ROLE.CLIENT);
      newRoles.push(ROLE.AGENT);
    } else {
      newRoles = [...selectedRoles, role];
    }

    setSelectedRoles(newRoles);
  };

  const isRoleDisabled = (role: ROLE) => {
    if (role === ROLE.CLIENT) {
      return selectedRoles.includes(ROLE.ADMIN) || selectedRoles.includes(ROLE.AGENT);
    }
    if (role === ROLE.ADMIN || role === ROLE.AGENT) {
      return selectedRoles.includes(ROLE.CLIENT);
    }
    return false;
  };

  const getRoleCard = (role: ROLE) => {
    const isSelected = selectedRoles.includes(role);
    const isDisabled = isRoleDisabled(role);

    const roleConfig = {
      [ROLE.ADMIN]: {
        title: t('user:step1.roles.admin.title'),
        description: t('user:step1.roles.admin.description'),
        icon: (
          <AdminPanelSettingsIcon
            sx={{ fontSize: 40, color: isSelected ? 'white' : 'primary.main' }}
          />
        ),
      },
      [ROLE.AGENT]: {
        title: t('user:step1.roles.agent.title'),
        description: t('user:step1.roles.agent.description'),
        icon: <BusinessIcon sx={{ fontSize: 40, color: isSelected ? 'white' : 'primary.main' }} />,
      },
      [ROLE.CLIENT]: {
        title: t('user:step1.roles.client.title'),
        description: t('user:step1.roles.client.description'),
        icon: <PersonIcon sx={{ fontSize: 40, color: isSelected ? 'white' : 'primary.main' }} />,
      },
    };

    const config = roleConfig[role];

    return (
      <Card
        sx={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          border: isSelected ? '2px solid primary.main' : '2px solid transparent',
          backgroundColor: isSelected ? 'primary.main' : 'background.paper',
          position: 'relative',
          '&:hover': !isDisabled
            ? {
                boxShadow: 2,
              }
            : {},
        }}
        onClick={() => !isDisabled && handleRoleToggle(role)}
      >
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
            }}
          >
            <Check sx={{ color: 'success.main', fontSize: 23 }} />
          </Box>
        )}
        <CardContent
          sx={{
            textAlign: 'center',
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ mb: 2 }}>{config.icon}</Box>
          <Typography
            variant="h6"
            sx={{
              color: isSelected ? 'white' : 'text.primary',
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            {config.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
            }}
          >
            {config.description}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const formData = { ...data, roles: selectedRoles };
      next(formData);
    },
  }));

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 1 }}>
        {t('user:step1.title')}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
        {t('user:step1.description')}
      </Typography>

      {selectedRoles.includes(ROLE.ADMIN) && selectedRoles.includes(ROLE.AGENT) && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">{t('user:step1.alerts.admin_agent_combination')}</Typography>
        </Alert>
      )}

      {selectedRoles.includes(ROLE.ADMIN) && !selectedRoles.includes(ROLE.AGENT) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">{t('user:step1.alerts.admin_only_tip')}</Typography>
        </Alert>
      )}

      {selectedRoles.includes(ROLE.AGENT) && !selectedRoles.includes(ROLE.ADMIN) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">{t('user:step1.alerts.agent_only_tip')}</Typography>
        </Alert>
      )}

      {selectedRoles.includes(ROLE.CLIENT) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">{t('user:step1.alerts.client_account')}</Typography>
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        {getRoleCard(ROLE.ADMIN)}
        {getRoleCard(ROLE.AGENT)}
        {getRoleCard(ROLE.CLIENT)}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center">
        {selectedRoles.map((role) => (
          <Chip
            key={role}
            label={role}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        ))}
      </Stack>
    </Card>
  );
});

export default CreateUserStep1 as StepComponent<FormStepRef, FormStepProps>;
