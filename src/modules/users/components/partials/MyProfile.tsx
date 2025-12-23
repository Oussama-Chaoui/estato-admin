import {
  Box,
  Grid,
  Typography,
  Chip,
  Avatar,
  Button,
  IconButton,
  Paper,
  Stack,
  Modal,
  Fab,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import FormProvider, { RHFTextField } from '@common/components/lib/react-hook-form';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import useAuth from '@modules/auth/hooks/api/useAuth';
import {
  LockOpen,
  Person,
  Badge,
  Work,
  Description,
  Edit,
  Email,
  Phone,
  School,
  BusinessCenter,
  Home,
  CameraAlt,
} from '@mui/icons-material';
import useUsers, { UpdateOneInput } from '@modules/users/hooks/api/useUsers';
import useUploads from '@modules/uploads/hooks/api/useUploads';
import { ROLE } from '@modules/permissions/defs/types';
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  field: string;
  onEdit: (field: string, value: string) => void;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ icon, label, value, field, onEdit }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'grey.200',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: 'primary.main',
        boxShadow: 1,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
        <Box
          sx={{
            color: 'primary.main',
            bgcolor: 'primary.lighter',
            borderRadius: 1.5,
            p: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {value}
          </Typography>
        </Box>
      </Box>
      <IconButton
        size="small"
        onClick={() => onEdit(field, value)}
        sx={{
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.lighter',
          },
        }}
      >
        <Edit fontSize="small" />
      </IconButton>
    </Box>
  </Paper>
);

const MyProfile = () => {
  const { user, mutate: mutateUser } = useAuth();
  const { updateOne } = useUsers();
  const { createOne, deleteOne } = useUploads();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(['user', 'common']);

  const hasRole = (role: ROLE) => user?.rolesNames?.includes(role);
  const isAdmin = hasRole(ROLE.ADMIN);
  const isAgent = hasRole(ROLE.AGENT);

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(field === 'password' ? '' : currentValue || '');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    setIsSubmitting(true);
    try {
      const currentPhotoId = user?.photoId;

      const uploadResponse = await createOne(
        { file },
        {
          displayProgress: true,
          displaySuccess: true,
        }
      );

      if (uploadResponse.success && uploadResponse.data?.item?.id) {
        await updateOne(
          user.id,
          {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.rolesNames[0],
            roles: user.rolesNames,
            photoId: uploadResponse.data.item.id.toString(),
          } as UpdateOneInput,
          {
            displayProgress: true,
            displaySuccess: true,
          }
        );

        await mutateUser();

        if (currentPhotoId) {
          try {
            await deleteOne(currentPhotoId);
          } catch (deleteError) {
            console.warn('Failed to delete old image:', deleteError);
          }
        }
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getFieldSchema = (field: string) => {
    const baseSchema: Record<string, Yup.AnySchema> = {};

    switch (field) {
      case 'email':
        baseSchema[field] = Yup.string()
          .required(t('user:step2.validation.email_required'))
          .email(t('user:step2.validation.email_invalid'))
          .max(191, t('common:field_too_long'));
        break;
      case 'phone':
        baseSchema[field] = Yup.string()
          .required(t('user:step2.validation.phone_required'))
          .max(191, t('common:field_too_long'));
        break;
      case 'password':
        baseSchema[field] = Yup.string()
          .max(191, t('common:field_too_long'))
          .required(t('user:step2.validation.password_required'));
        baseSchema.confirmPassword = Yup.string()
          .oneOf([Yup.ref('password')], t('common:passwords_not_match'))
          .required(t('common:password_confirmation'));
        break;
      case 'licenceNumber':
        baseSchema[field] = Yup.string()
          .required(t('user:step2.validation.license_required'))
          .max(191, t('common:field_too_long'));
        break;
      case 'experience':
        baseSchema[field] = Yup.number()
          .required(t('user:step2.validation.experience_required'))
          .min(0, t('user:step2.validation.experience_min'))
          .integer(t('user:step2.validation.experience_min'));
        break;
      case 'bio':
        baseSchema[field] = Yup.string().max(500, t('common:field_too_long'));
        break;
      case 'agencyName':
        baseSchema[field] = Yup.string()
          .required(t('user:step2.validation.agency_name_required'))
          .max(191, t('common:field_too_long'));
        break;
      case 'agencyAddress':
        baseSchema[field] = Yup.string()
          .required(t('user:step2.validation.agency_address_required'))
          .max(500, t('common:field_too_long'));
        break;
      default:
        baseSchema[field] = Yup.string().max(191, t('common:field_too_long'));
    }

    return Yup.object().shape(baseSchema);
  };

  const modalMethods = useForm({
    resolver: yupResolver(getFieldSchema(editingField || '')),
    defaultValues: {
      [editingField || '']: editValue,
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    if (editingField) {
      modalMethods.reset({
        [editingField]: editValue,
        confirmPassword: '',
      });
    }
  }, [editingField, editValue, modalMethods]);

  const handleModalSave = async (data: Record<string, string | number>) => {
    if (!user || !editingField) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: UpdateOneInput = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.rolesNames[0],
        roles: user.rolesNames,
        [editingField]: data[editingField],
      };

      await updateOne(user.id, updateData, { displayProgress: true, displaySuccess: true });

      await mutateUser();

      setEditingField(null);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      email: t('common:email'),
      phone: t('user:step2.fields.phone_number'),
      password: t('user:profile.new_password'),
      licenceNumber: t('user:step2.fields.license_number'),
      experience: t('user:step2.fields.experience_years'),
      bio: t('user:step2.fields.bio'),
      agencyName: t('user:step2.fields.agency_name'),
      agencyAddress: t('user:step2.fields.agency_address'),
    };
    return labels[field] || 'Field';
  };

  const getFieldType = (field: string): string => {
    const types: Record<string, string> = {
      password: 'password',
      email: 'email',
      phone: 'tel',
      experience: 'number',
    };
    return types[field] || 'text';
  };

  const getFieldPlaceholder = (field: string): string => {
    const placeholders: Record<string, string> = {
      phone: t('user:step2.fields.phone_number'),
      email: t('common:email'),
      password: t('user:profile.password_placeholder'),
      licenceNumber: t('user:step2.fields.license_number'),
      experience: t('user:step2.fields.experience_years'),
      bio: t('user:step2.fields.bio_placeholder'),
      agencyName: t('user:step2.fields.agency_name'),
      agencyAddress: t('user:step2.fields.agency_address'),
    };
    return placeholders[field] || 'Enter value';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 20 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={user?.photo?.url || undefined}
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
                    width: 200,
                    height: 200,
                    border: '4px solid',
                    borderColor: 'primary.main',
                    mb: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    bgcolor: 'background.default',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={handleAvatarClick}
                >
                  {!user?.photo?.url && <Person sx={{ fontSize: 80 }} />}
                </Avatar>
                <Fab
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  onClick={handleAvatarClick}
                >
                  <CameraAlt />
                </Fab>
              </Box>

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
                {user?.name}
              </Typography>

              <Box
                sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}
              >
                {user?.rolesNames?.map((role) => {
                  let roleColor: 'default' | 'error' | 'primary' = 'default';
                  if (role === ROLE.ADMIN) {
                    roleColor = 'error';
                  } else if (role === ROLE.AGENT) {
                    roleColor = 'primary';
                  }

                  return <Chip key={role} label={role} color={roleColor} size="small" />;
                })}
              </Box>

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {isAdmin && 'Administrateur du système'}
                {isAgent && 'Agent immobilier'}
                {!isAdmin && !isAgent && 'Utilisateur'}
              </Typography>
            </Box>

            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
            >
              <Person color="primary" />
              {t('user:profile.contact')}
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {user?.email || t('user:profile.not_provided')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {user?.phone || t('user:profile.not_provided')}
                </Typography>
              </Box>
            </Stack>

            {isAgent && (
              <>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <Work color="primary" />
                  Statistiques
                </Typography>

                <Stack spacing={2}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Expérience
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {user?.agent?.experience || 0} ans
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Licence
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {user?.agent?.licenceNumber || 'Non renseigné'}
                    </Typography>
                  </Box>
                </Stack>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'primary.main' }}
              >
                <Person color="primary" />
                {t('user:profile.personal_info')}
              </Typography>

              <ProfileField
                icon={<Email color="primary" />}
                label={t('common:email')}
                value={user?.email || ''}
                field="email"
                onEdit={handleEdit}
              />

              <ProfileField
                icon={<Phone color="primary" />}
                label={t('user:step2.fields.phone_number')}
                value={user?.phone || ''}
                field="phone"
                onEdit={handleEdit}
              />

              <ProfileField
                icon={<LockOpen color="primary" />}
                label={t('common:password')}
                value="••••••••"
                field="password"
                onEdit={handleEdit}
              />
            </Paper>

            {isAgent && (
              <Paper sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 3,
                    color: 'primary.main',
                  }}
                >
                  <Work color="primary" />
                  {t('user:profile.professional_info')}
                </Typography>

                <ProfileField
                  icon={<Badge color="primary" />}
                  label={t('user:step2.fields.license_number')}
                  value={user?.agent?.licenceNumber || ''}
                  field="licenceNumber"
                  onEdit={handleEdit}
                />

                <ProfileField
                  icon={<School color="primary" />}
                  label={t('user:step2.fields.experience_years')}
                  value={user?.agent?.experience?.toString() || ''}
                  field="experience"
                  onEdit={handleEdit}
                />

                <ProfileField
                  icon={<Description color="primary" />}
                  label={t('user:step2.fields.bio')}
                  value={user?.agent?.bio || ''}
                  field="bio"
                  onEdit={handleEdit}
                />

                <ProfileField
                  icon={<BusinessCenter color="primary" />}
                  label={t('user:step2.fields.agency_name')}
                  value={user?.agent?.agencyName || ''}
                  field="agencyName"
                  onEdit={handleEdit}
                />

                <ProfileField
                  icon={<Home color="primary" />}
                  label={t('user:step2.fields.agency_address')}
                  value={user?.agent?.agencyAddress || ''}
                  field="agencyAddress"
                  onEdit={handleEdit}
                />
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <Modal
        open={editingField !== null}
        onClose={handleCancel}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper
          sx={{
            width: '100%',
            maxWidth: 500,
            p: 3,
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            outline: 'none',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {editingField === 'email' && t('user:profile.edit_email')}
            {editingField === 'phone' && t('user:profile.edit_phone')}
            {editingField === 'password' && t('user:profile.edit_password')}
            {editingField === 'licenceNumber' && t('user:profile.edit_license')}
            {editingField === 'experience' && t('user:profile.edit_experience')}
            {editingField === 'bio' && t('user:profile.edit_bio')}
            {editingField === 'agencyName' && t('user:profile.edit_agency_name')}
            {editingField === 'agencyAddress' && t('user:profile.edit_agency_address')}
          </Typography>

          <FormProvider
            methods={modalMethods}
            onSubmit={modalMethods.handleSubmit(handleModalSave)}
          >
            <Box sx={{ mb: 3 }}>
              <RHFTextField
                name={editingField!}
                label={getFieldLabel(editingField!)}
                type={getFieldType(editingField!)}
                multiline={editingField === 'bio' || editingField === 'agencyAddress'}
                rows={editingField === 'bio' || editingField === 'agencyAddress' ? 4 : 1}
                fullWidth
                autoFocus
                placeholder={getFieldPlaceholder(editingField!)}
              />

              {editingField === 'password' && (
                <RHFTextField
                  name="confirmPassword"
                  label={t('user:profile.confirm_password')}
                  type="password"
                  fullWidth
                  sx={{ mt: 2 }}
                  placeholder={t('user:profile.confirm_password_placeholder')}
                />
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                onClick={handleCancel}
                variant="outlined"
                sx={{
                  minWidth: 80,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {t('common:cancel')}
              </Button>
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                variant="contained"
                sx={{
                  minWidth: 100,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                {t('common:save')}
              </LoadingButton>
            </Box>
          </FormProvider>
        </Paper>
      </Modal>
    </Box>
  );
};

export default MyProfile;
