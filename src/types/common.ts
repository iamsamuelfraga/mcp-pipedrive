// Common types used across Pipedrive API

export interface PipedriveResponse<T> {
  success: boolean;
  data: T;
  related_objects?: Record<string, unknown>;
  additional_data?: {
    pagination?: Pagination;
  };
}

export interface Pagination {
  start: number;
  limit: number;
  more_items_in_collection: boolean;
  next_start?: number;
}

export interface Email {
  value: string;
  primary: boolean;
  label: string;
}

export interface Phone {
  value: string;
  primary: boolean;
  label: string;
}

export interface Picture {
  id: number;
  item_type: string;
  item_id: number;
  active_flag: boolean;
  add_time: string;
  update_time: string;
  added_by_user_id: number;
  pictures: {
    '128': string;
    '512': string;
  };
}

export type VisibilityLevel = '1' | '3' | '5' | '7';
// 1 = Owner only
// 3 = Entire company
// 5 = Owner's followers
// 7 = Owner and users in visibility group

export type MarketingStatus = 'no_consent' | 'unsubscribed' | 'subscribed' | 'archived';

export type DealStatus = 'open' | 'won' | 'lost' | 'deleted';

export type CustomFields = Record<string, string | number | boolean | null | undefined>;
