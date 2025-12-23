import ApiRoutes from '@common/defs/api-routes';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { AgentApplication } from '@modules/agent-applications/defs/types';

export interface CreateOneInput {
  name: string;
  email?: string;
  phone: string;
  status?: string;
}

export interface UpdateOneInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

const useAgentApplications: UseItems<AgentApplication, CreateOneInput, UpdateOneInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.AgentApplications;
  const useItemsHook = useItems<AgentApplication, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  return useItemsHook;
};

export default useAgentApplications;
