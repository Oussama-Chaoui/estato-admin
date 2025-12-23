import { ROLE } from '@modules/permissions/defs/types';

export const ROLES_OPTIONS = [
  { value: ROLE.ADMIN, label: 'common:admin_role' },
  { value: ROLE.AGENT, label: 'common:agent_role' },
  { value: ROLE.CLIENT, label: 'common:client_role' },
];
