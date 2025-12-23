const prefix = '/auth';
const ApiRoutes = {
  Login: prefix + '/login',
  Register: prefix + '/register',
  Logout: prefix + '/logout',
  RequestPasswordReset: prefix + '/request-password-reset',
  GetPasswordResetInfo: prefix + '/get-password-reset-info',
  ResetPassword: prefix + '/reset-password',
  Me: prefix + '/me',
};

export default ApiRoutes;
