import { MultilingualText } from '@common/utils/translations';

export enum NotificationType {
  AGENT_APPLICATION = 'AGENT_APPLICATION',
  PROPERTY_STATUS_CHANGE = 'PROPERTY_STATUS_CHANGE',
  NEW_PROPERTY_INQUIRY = 'NEW_PROPERTY_INQUIRY',
  NEW_APPOINTMENT = 'NEW_APPOINTMENT',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  USER_ACCOUNT_UPDATE = 'USER_ACCOUNT_UPDATE',
}

export interface Notification {
  id: string;
  type: NotificationType;
  notifiableType: string;
  notifiableId: number;
  data: {
    id: string;
    type: NotificationType;
    title: MultilingualText;
    message: MultilingualText;
    agentId?: number;
    agentName?: string;
    agencyName?: string;
    licenceNumber?: string;
    propertyId?: number;
    propertyTitle?: string;
    oldStatus?: string;
    newStatus?: string;
    oldStatusLabels?: MultilingualText;
    newStatusLabels?: MultilingualText;
    actionUrl: string;
    icon: string;
    createdAt: string;
  };
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  items: Notification[];
  meta: {
    currentPage: number;
    lastPage: number;
    totalItems: number;
  };
}

export interface UnreadCountData {
  count: number;
}
