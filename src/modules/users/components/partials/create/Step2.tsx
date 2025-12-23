import {
  FormStepProps,
  FormStepRef,
  StepComponent,
} from '@common/components/lib/navigation/FormStepper';
import { RHFTextField } from '@common/components/lib/react-hook-form';
import CreateCrudItemForm from '@common/components/partials/CreateCrudItemForm';
import { CurrentFormStepRef } from '@common/components/partials/UpsertCrudItemForm';
import Routes from '@common/defs/routes';
import { ROLE } from '@modules/permissions/defs/types';
import { User } from '@modules/users/defs/types';
import useUsers, { CreateOneInput } from '@modules/users/hooks/api/useUsers';
import { Grid, Typography, Box, CardContent, Chip, Stack } from '@mui/material';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

const CreateUserStep2 = forwardRef<FormStepRef, FormStepProps>(({ next, data }, ref) => {
  const formRef = useRef<CurrentFormStepRef>();
  const { t } = useTranslation(['user', 'common']);

  const selectedRoles = (data?.roles as ROLE[]) || [];
  const hasAgentRole = selectedRoles.includes(ROLE.AGENT);
  const hasClientRole = selectedRoles.includes(ROLE.CLIENT);

  const isEditing = Boolean(data?.id);

  const getSchema = () => {
    const baseSchema: Record<string, Yup.AnySchema> = {
      name: Yup.string().required(t('user:step2.validation.name_required')),
      email: Yup.string()
        .required(t('user:step2.validation.email_required'))
        .email(t('user:step2.validation.email_invalid')),
      phone: Yup.string().required(t('user:step2.validation.phone_required')),
      password: isEditing
        ? Yup.string().nullable()
        : Yup.string().required(t('user:step2.validation.password_required')),
    };

    if (hasAgentRole) {
      baseSchema.licenceNumber = Yup.string().required(t('user:step2.validation.license_required'));
      baseSchema.experience = Yup.number()
        .required(t('user:step2.validation.experience_required'))
        .min(0, t('user:step2.validation.experience_min'));
      baseSchema.agencyName = Yup.string().required(
        t('user:step2.validation.agency_name_required')
      );
      baseSchema.agencyAddress = Yup.string().required(
        t('user:step2.validation.agency_address_required')
      );
      baseSchema.bio = Yup.string().nullable();
    }

    if (hasClientRole) {
      baseSchema.nicNumber = Yup.string().nullable();
      baseSchema.passport = Yup.string().nullable();
      baseSchema.nicNumber = Yup.string().test({
        name: 'client-identifier',
        message: t('user:step2.validation.client_identifier_required'),
        test(_value, context) {
          const { nicNumber, passport } = context.parent;
          return (
            (nicNumber && nicNumber.trim().length > 0) || (passport && passport.trim().length > 0)
          );
        },
      });
    }

    return Yup.object().shape(baseSchema);
  };

  const defaultValues: Partial<CreateOneInput> = {
    name: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    password: data?.password || '',
    licenceNumber: data?.licenceNumber || '',
    experience: data?.experience || 0,
    bio: data?.bio || '',
    agencyName: data?.agencyName || '',
    agencyAddress: data?.agencyAddress || '',
    nicNumber: data?.nicNumber || '',
    passport: data?.passport || '',
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const res = await formRef?.current?.submit();
      if (res && !res.hasErrors) {
        next(res?.data);
      }
    },
  }));

  const getRoleIcon = (role: ROLE) => {
    switch (role) {
      case ROLE.ADMIN:
        return <AdminPanelSettingsIcon sx={{ fontSize: 20, mr: 1 }} />;
      case ROLE.AGENT:
        return <BusinessIcon sx={{ fontSize: 20, mr: 1 }} />;
      case ROLE.CLIENT:
        return <PersonIcon sx={{ fontSize: 20, mr: 1 }} />;
      default:
        return undefined;
    }
  };

  return (
    <>
      <CreateCrudItemForm<User, CreateOneInput>
        routes={Routes.Users}
        useItems={useUsers}
        schema={getSchema()}
        defaultValues={defaultValues}
        ref={formRef}
        displayCard
        displayFooter={false}
      >
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              {t('user:step2.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              {t('user:step2.description')}
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {selectedRoles.map((role) => (
                <Chip
                  key={role}
                  icon={getRoleIcon(role)}
                  label={role}
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 'bold', mb: 1 }}
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {t('user:step2.sections.basic_info')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="name"
                    label={t('user:step2.fields.full_name')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="email"
                    label={t('user:step2.fields.email_address')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="phone"
                    label={t('user:step2.fields.phone_number')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="password"
                    label={t('user:step2.fields.password')}
                    type="password"
                    required={!isEditing}
                    fullWidth
                    placeholder={
                      isEditing
                        ? t('user:step2.fields.password_placeholder_edit')
                        : t('user:step2.fields.password_placeholder_new')
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Box>

          {hasAgentRole && (
            <Box sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BusinessIcon sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{t('user:step2.sections.agent_info')}</Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="licenceNumber"
                      label={t('user:step2.fields.license_number')}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="experience"
                      label={t('user:step2.fields.experience_years')}
                      type="number"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="agencyName"
                      label={t('user:step2.fields.agency_name')}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="agencyAddress"
                      label={t('user:step2.fields.agency_address')}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField
                      name="bio"
                      label={t('user:step2.fields.bio')}
                      multiline
                      rows={4}
                      fullWidth
                      placeholder={t('user:step2.fields.bio_placeholder')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Box>
          )}

          {hasClientRole && (
            <Box sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{t('user:step2.sections.client_info')}</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  {t('user:step2.client_description')}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="nicNumber"
                      label={t('user:step2.fields.nic_number')}
                      fullWidth
                      placeholder={t('user:step2.fields.nic_placeholder')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="passport"
                      label={t('user:step2.fields.passport_number')}
                      fullWidth
                      placeholder={t('user:step2.fields.passport_placeholder')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Box>
          )}
        </Box>
      </CreateCrudItemForm>
    </>
  );
});

export default CreateUserStep2 as StepComponent<FormStepRef, FormStepProps>;
