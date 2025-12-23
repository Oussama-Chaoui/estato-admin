import { CrudObject } from '@common/defs/types';

export enum AGENT_APPLICATION_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface AgentApplication extends CrudObject {
  name: string;
  email?: string;
  phone: string;
  status: AGENT_APPLICATION_STATUS;
}

export interface CreateOneInput {
  name: string;
  email?: string;
  phone: string;
  status?: AGENT_APPLICATION_STATUS;
}

export interface UpdateOneInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: AGENT_APPLICATION_STATUS;
}
