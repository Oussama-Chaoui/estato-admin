import FormProvider, { RHFTextField } from '@common/components/lib/react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth, { LoginInput } from '@modules/auth/hooks/api/useAuth';
import { LockOpen } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import Link from '@mui/material/Link';
import Routes from '@common/defs/routes';
import { useTranslation } from 'react-i18next';
import { Box, useTheme } from '@mui/material';

const LoginForm = () => {
  const { login } = useAuth();
  const { t } = useTranslation(['sign-in', 'common']);
  const theme = useTheme();

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('common:email_format_incorrect'))
      .required(t('common:field_required')),
    password: Yup.string().required(t('common:field_required')),
  });
  const methods = useForm<LoginInput>({
    resolver: yupResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const onSubmit = async (data: LoginInput) => {
    await login(
      {
        email: data.email,
        password: data.password,
      },
      { displayProgress: true, displaySuccess: true }
    );
  };
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        background: theme.palette.background.default,
        height: '100%',
      }}
    >
      <Card
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          padding: '48px 32px',
          borderRadius: '12px',
          background: theme.palette.background.paper,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 8px 32px ${theme.palette.primary.main}20`,
          border: `1px solid ${theme.palette.primary.main}10`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 12px 40px ${theme.palette.primary.main}30`,
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-block',
              padding: 2,
              borderRadius: '50%',
              background: theme.palette.primary.lighter,
              mb: 2,
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme.palette.primary.main}
              style={{ strokeWidth: 1.5 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </Box>
          <Typography
            component="h1"
            variant="h3"
            sx={{
              fontWeight: 300,
              color: theme.palette.text.primary,
              mb: 1,
            }}
          >
            {t('sign-in:welcome_back')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 300,
            }}
          >
            {t('sign-in:sign_in_to_continue')}
          </Typography>
        </Box>

        <Box
          sx={{ padding: '40px', background: theme.palette.background.paper, borderRadius: '16px' }}
        >
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <RHFTextField name="email" label={t('common:email')} />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="password" label={t('common:password')} type="password" />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <LoadingButton
                  size="large"
                  variant="contained"
                  type="submit"
                  startIcon={<LockOpen />}
                  loadingPosition="start"
                  loading={isSubmitting}
                  sx={{
                    width: '100%',
                    height: '48px',
                    borderRadius: '12px',
                    background: theme.palette.primary.main,
                    fontSize: '16px',
                    fontWeight: 500,
                    textTransform: 'none',
                    boxShadow: `0 1px 3px ${theme.palette.common.black}10`,
                    '&:hover': {
                      background: theme.palette.primary.dark,
                      boxShadow: `0 4px 6px ${theme.palette.common.black}10`,
                    },
                    '&:disabled': {
                      background: theme.palette.primary.main,
                    },
                  }}
                >
                  {t('sign-in:sign_in')}
                </LoadingButton>
              </Grid>
            </Grid>
          </FormProvider>
        </Box>

        <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', color: theme.palette.text.secondary }}
          >
            {t('sign-in:forgot_password_text')}{' '}
            <Link
              href={Routes.Auth.RequestPasswordReset}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.dark,
                },
              }}
            >
              {t('sign-in:forgot_password_link_text')}
            </Link>
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginForm;
