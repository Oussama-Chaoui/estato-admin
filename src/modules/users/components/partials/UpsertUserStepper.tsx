import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Id } from '@common/defs/types';
import FormStepper, { FormStep } from '@common/components/lib/navigation/FormStepper';
import Routes from '@common/defs/routes';
import Step1 from '@modules/users/components/partials/create/Step1';
import Step2 from '@modules/users/components/partials/create/Step2';
import useUsers, { CreateOneInput, UpdateOneInput } from '@modules/users/hooks/api/useUsers';
import { User } from '@modules/users/defs/types';
import { ROLE } from '@modules/permissions/defs/types';

enum UPSERT_USER_STEP_ID {
  STEP1 = 'step1',
  STEP2 = 'step2',
}

interface UpsertUserStepperProps {
  itemId?: Id;
  preSelectedRole?: ROLE;
  onClose?: () => void;
}

const mapUserToInput = (user: User): CreateOneInput => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: '',
    role: user.rolesNames[0] as ROLE,
    roles: user.rolesNames as ROLE[],
    licenceNumber: user.agent?.licenceNumber || '',
    experience: Number(user.agent?.experience) || 0,
    bio: user.agent?.bio || '',
    agencyName: user.agent?.agencyName || '',
    agencyAddress: user.agent?.agencyAddress || '',
    nicNumber: user.client?.nicNumber || '',
    passport: user.client?.passport || '',
  };
};

const UpsertUserStepper = ({ itemId, preSelectedRole, onClose }: UpsertUserStepperProps) => {
  const { createOne, updateOne, readOne } = useUsers();
  const router = useRouter();
  const { t } = useTranslation(['user']);
  const theme = useTheme();

  const [item, setItem] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (itemId) {
      setLoading(true);
      (async () => {
        const response = await readOne(itemId);
        if (response.success) {
          setItem(response.data?.item as User);
        }
        setLoading(false);
      })();
    }
  }, [itemId]);

  const steps: FormStep<UPSERT_USER_STEP_ID>[] = [
    {
      id: UPSERT_USER_STEP_ID.STEP1,
      label: t('user:form.step1_label'),
      component: Step1,
    },
    {
      id: UPSERT_USER_STEP_ID.STEP2,
      label: t('user:form.step2_label'),
      component: Step2,
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
      // If called from modal, close it instead of navigating
      if (onClose) {
        onClose();
      } else {
        router.push(Routes.Users.ReadAll);
      }
      return true;
    }
    return false;
  };

  if (itemId && loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper
          sx={{
            p: 6,
            backgroundColor: theme.palette.background.paper,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            gap: 3,
          }}
        >
          <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 500 }}>
            {t('user:stepper.loading_user_details')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('user:stepper.loading_description')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Create initial data with pre-selected role
  const getInitialData = () => {
    if (item) {
      return mapUserToInput(item);
    }
    if (preSelectedRole) {
      return {
        role: preSelectedRole,
        roles: [preSelectedRole],
      } as Partial<CreateOneInput>;
    }
    return undefined;
  };

  return (
    <FormStepper<CreateOneInput, UPSERT_USER_STEP_ID>
      key={`upsert-user-stepper-${itemId ?? 'new'}-${preSelectedRole ?? 'none'}`}
      id={`upsert-user-stepper-${itemId ?? 'new'}`}
      steps={steps}
      onSubmit={onSubmit}
      initialData={getInitialData() as CreateOneInput}
    />
  );
};

export default UpsertUserStepper;
