export enum WEBSITE_FOCUS {
  DAILY_RENT = 'DAILY_RENT',
  RENT = 'RENT',
  SELLING = 'SELLING',
  ALL = 'ALL',
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteFocusResponse {
  website_focus?: string;
  websiteFocus?: WEBSITE_FOCUS;
}

export interface SettingsData {
  items: Setting[];
  meta: {
    currentPage: number;
    lastPage: number;
    totalItems: number;
  };
}
