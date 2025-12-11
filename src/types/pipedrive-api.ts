import type {
  Email,
  Phone,
  VisibilityLevel,
  MarketingStatus,
  DealStatus,
  CustomFields,
} from './common.js';

// Lead Types
export interface LeadValue {
  amount: number;
  currency: string;
}

export interface LeadBase {
  id: string; // UUID
  title: string;
  owner_id: number;
  creator_id: number;
  label_ids: string[]; // Array of UUIDs
  person_id: number | null;
  organization_id: number | null;
  source_name: string;
  origin: string;
  origin_id: string | null;
  channel: number | null;
  channel_id: string | null;
  is_archived: boolean;
  was_seen: boolean;
  value: LeadValue | null;
  expected_close_date: string | null;
  next_activity_id: number | null;
  add_time: string;
  update_time: string;
  visible_to: VisibilityLevel;
  cc_email: string;
}

export type Lead = LeadBase & CustomFields;

export interface LeadLabel {
  id: string; // UUID
  name: string;
  color: string;
  add_time: string;
  update_time: string;
}

export interface LeadSource {
  name: string;
}

// Deal Types
export interface DealBase {
  id: number;
  creator_user_id: number | UserReference;
  user_id: number | UserReference;
  person_id: number | PersonReference | null;
  org_id: number | OrganizationReference | null;
  stage_id: number;
  title: string;
  value: number;
  currency: string;
  add_time: string;
  update_time: string;
  stage_change_time: string;
  active: boolean;
  deleted: boolean;
  status: DealStatus;
  probability: number | null;
  next_activity_date: string | null;
  next_activity_time: string | null;
  next_activity_id: number | null;
  last_activity_id: number | null;
  last_activity_date: string | null;
  lost_reason: string | null;
  visible_to: VisibilityLevel;
  close_time: string | null;
  pipeline_id: number;
  won_time: string | null;
  first_won_time: string | null;
  lost_time: string | null;
  products_count: number;
  files_count: number;
  notes_count: number;
  followers_count: number;
  email_messages_count: number;
  activities_count: number;
  done_activities_count: number;
  undone_activities_count: number;
  participants_count: number;
  expected_close_date: string | null;
  last_incoming_mail_time: string | null;
  last_outgoing_mail_time: string | null;
  label: string | number | null;
  stage_order_nr: number;
  person_name: string | null;
  org_name: string | null;
  next_activity_subject: string | null;
  next_activity_type: string | null;
  next_activity_duration: string | null;
  next_activity_note: string | null;
  formatted_value: string;
  weighted_value: number;
  formatted_weighted_value: string;
  weighted_value_currency: string;
  rotten_time: string | null;
  owner_name: string;
  cc_email: string;
  org_hidden: boolean;
  person_hidden: boolean;
  // Revenue metrics
  acv?: number;
  acv_currency?: string;
  arr?: number;
  arr_currency?: string;
  mrr?: number;
  mrr_currency?: string;
}

export type Deal = DealBase & CustomFields;

// Person Types
export interface PersonBase {
  id: number;
  company_id: number;
  owner_id: number | UserReference;
  org_id: number | OrganizationReference | null;
  name: string;
  first_name: string;
  last_name: string;
  active_flag: boolean;
  phone: Phone[];
  email: Email[];
  primary_email: string | null;
  first_char: string;
  update_time: string;
  add_time: string;
  visible_to: VisibilityLevel;
  marketing_status: MarketingStatus;
  picture_id: number | null;
  label: number | null;
  label_ids: number[];
  org_name: string | null;
  owner_name: string;
  cc_email: string;
  // Counts
  open_deals_count: number;
  related_open_deals_count: number;
  closed_deals_count: number;
  related_closed_deals_count: number;
  participant_open_deals_count: number;
  participant_closed_deals_count: number;
  email_messages_count: number;
  activities_count: number;
  done_activities_count: number;
  undone_activities_count: number;
  files_count: number;
  notes_count: number;
  followers_count: number;
  won_deals_count: number;
  related_won_deals_count: number;
  lost_deals_count: number;
  related_lost_deals_count: number;
  // Timeline
  next_activity_date: string | null;
  next_activity_time: string | null;
  next_activity_id: number | null;
  last_activity_id: number | null;
  last_activity_date: string | null;
  last_incoming_mail_time: string | null;
  last_outgoing_mail_time: string | null;
}

export type Person = PersonBase & CustomFields;

// Organization Types
export interface OrganizationBase {
  id: number;
  company_id: number;
  owner_id: number | UserReference;
  name: string;
  active_flag: boolean;
  people_count: number;
  open_deals_count: number;
  related_open_deals_count: number;
  closed_deals_count: number;
  related_closed_deals_count: number;
  email_messages_count: number;
  activities_count: number;
  done_activities_count: number;
  undone_activities_count: number;
  files_count: number;
  notes_count: number;
  followers_count: number;
  won_deals_count: number;
  related_won_deals_count: number;
  lost_deals_count: number;
  related_lost_deals_count: number;
  // Address fields
  address: string | null;
  address_subpremise: string | null;
  address_street_number: string | null;
  address_route: string | null;
  address_sublocality: string | null;
  address_locality: string | null;
  address_admin_area_level_1: string | null;
  address_admin_area_level_2: string | null;
  address_country: string | null;
  address_postal_code: string | null;
  address_formatted_address: string | null;
  // Metadata
  update_time: string;
  add_time: string;
  visible_to: VisibilityLevel;
  label: number | null;
  label_ids: number[];
  owner_name: string;
  cc_email: string;
  picture_id: number | null;
  // Timeline
  next_activity_date: string | null;
  next_activity_time: string | null;
  next_activity_id: number | null;
  last_activity_id: number | null;
  last_activity_date: string | null;
  last_incoming_mail_time: string | null;
  last_outgoing_mail_time: string | null;
}

export type Organization = OrganizationBase & CustomFields;

// Activity Types
export interface ActivityBase {
  id: number;
  company_id: number;
  user_id: number;
  done: boolean;
  type: string;
  reference_type: string | null;
  reference_id: number | null;
  conference_meeting_client: string | null;
  conference_meeting_url: string | null;
  conference_meeting_id: string | null;
  due_date: string;
  due_time: string | null;
  duration: string | null;
  busy_flag: boolean;
  add_time: string;
  marked_as_done_time: string | null;
  subject: string;
  public_description: string | null;
  calendar_sync_include_context: string | null;
  location: string | null;
  org_id: number | null;
  person_id: number | null;
  deal_id: number | null;
  lead_id: string | null;
  project_id: number | null;
  active_flag: boolean;
  update_time: string;
  update_user_id: number | null;
  note: string | null;
  person_name: string | null;
  org_name: string | null;
  deal_title: string | null;
  owner_name: string;
  person_dropbox_bcc: string | null;
  deal_dropbox_bcc: string | null;
  assigned_to_user_id: number | null;
  created_by_user_id: number;
  // Participants and attendees
  participants: ActivityParticipant[];
  attendees: ActivityAttendee[];
  file: ActivityFile | null;
}

export type Activity = ActivityBase & CustomFields;

export interface ActivityParticipant {
  person_id: number;
  primary_flag: boolean;
}

export interface ActivityAttendee {
  email_address: string;
  name?: string;
  user_id?: number;
  person_id?: number;
  status?: string;
}

export interface ActivityFile {
  id: string;
  clean_name: string;
  url: string;
}

// Pipeline Types
export interface Pipeline {
  id: number;
  name: string;
  url_title: string;
  order_nr: number;
  active: boolean;
  deal_probability: boolean;
  add_time: string;
  update_time: string;
  selected: boolean;
  deals_summary?: {
    total_count: number;
    total_currency_converted_value: number;
    total_weighted_currency_converted_value: number;
    total_currency_converted_value_formatted: string;
    total_weighted_currency_converted_value_formatted: string;
  };
}

export interface Stage {
  id: number;
  order_nr: number;
  name: string;
  active_flag: boolean;
  deal_probability: number;
  pipeline_id: number;
  rotten_flag: boolean;
  rotten_days: number | null;
  add_time: string;
  update_time: string;
  pipeline_name: string;
  pipeline_deal_probability: boolean;
}

// Note Types
export interface Note {
  id: number;
  user_id: number;
  deal_id: number | null;
  person_id: number | null;
  org_id: number | null;
  lead_id: string | null;
  content: string;
  add_time: string;
  update_time: string;
  active_flag: boolean;
  pinned_to_deal_flag: boolean;
  pinned_to_person_flag: boolean;
  pinned_to_organization_flag: boolean;
  pinned_to_lead_flag: boolean;
  last_update_user_id: number | null;
  organization: OrganizationReference | null;
  person: PersonReference | null;
  deal: DealReference | null;
  user: UserReference;
}

// File Types
export interface File {
  id: number;
  user_id: number;
  deal_id: number | null;
  person_id: number | null;
  org_id: number | null;
  product_id: number | null;
  activity_id: number | null;
  lead_id: string | null;
  add_time: string;
  update_time: string;
  file_name: string;
  file_type: string;
  file_size: number;
  active_flag: boolean;
  inline_flag: boolean;
  remote_location: string | null;
  remote_id: string | null;
  cid: string | null;
  s3_bucket: string | null;
  mail_message_id: string | null;
  mail_template_id: string | null;
  deal_name: string | null;
  person_name: string | null;
  org_name: string | null;
  product_name: string | null;
  url: string;
  name: string;
  description: string | null;
}

// User Types
export interface User {
  id: number;
  name: string;
  default_currency: string;
  locale: string;
  lang: number;
  email: string;
  phone: string | null;
  activated: boolean;
  last_login: string;
  created: string;
  modified: string;
  has_created_company: boolean;
  access: UserAccess[];
  active_flag: boolean;
  timezone_name: string;
  timezone_offset: string;
  role_id: number;
  icon_url: string | null;
  is_you: boolean;
  is_admin: number;
}

export interface UserAccess {
  app: string;
  admin: boolean;
  permission_set_id: string;
}

// Role Types
export interface Role {
  id: number;
  parent_role_id: number | null;
  name: string;
  active_flag: boolean;
  assignment_count: string;
  sub_role_count: string;
  level: number;
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
  can_override: boolean;
}

// Reference types (simplified versions when objects are nested)
export interface UserReference {
  id: number;
  name: string;
  email: string;
  has_pic: boolean;
  pic_hash: string | null;
  active_flag: boolean;
  value: number;
}

export interface PersonReference {
  active_flag: boolean;
  name: string;
  email: Email[];
  phone: Phone[];
  owner_id: number;
  value: number;
}

export interface OrganizationReference {
  name: string;
  people_count: number;
  owner_id: number;
  address: string | null;
  active_flag: boolean;
  cc_email: string;
  value: number;
}

export interface DealReference {
  id: number;
  title: string;
  value: number;
  currency: string;
  status: DealStatus;
  active: boolean;
}

// Goal Types
export interface GoalType {
  name: string;
  params?: Record<string, unknown>;
}

export interface GoalAssignee {
  id: number;
  type: 'person' | 'team';
}

export interface GoalExpectedOutcome {
  target: number;
  tracking_metric: string;
  currency_id?: number;
}

export interface GoalDuration {
  start: string;
  end: string;
}

export interface Goal {
  id: string;
  owner_id: number;
  title: string;
  type: GoalType;
  assignee: GoalAssignee;
  interval: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  duration: GoalDuration;
  expected_outcome: GoalExpectedOutcome;
  is_active: boolean;
  report_ids: string[];
  add_time: string;
  update_time: string;
}

// Task Types
export interface Task {
  id: number;
  creator_id: number;
  assignee_id: number | null;
  title: string;
  description: string | null;
  done: number; // 0 or 1
  due_date: string | null;
  parent_task_id: number | null;
  project_id: number | null;
  add_time: string;
  update_time: string;
  marked_as_done_time: string | null;
}

// ActivityType Types
export interface ActivityType {
  id: number;
  order_nr: number;
  name: string;
  key_string: string;
  icon_key: string;
  active_flag: boolean;
  color: string;
  is_custom_flag: boolean;
  add_time: string;
  update_time: string;
}

// CallLog Types
export interface CallLog {
  id: string;
  activity_id: number | null;
  person_id: number | null;
  org_id: number | null;
  deal_id: number | null;
  lead_id: string | null; // UUID
  subject: string | null;
  duration: string;
  outcome: string;
  from_phone_number: string | null;
  to_phone_number: string;
  has_recording: boolean;
  start_time: string;
  end_time: string;
  user_id: number;
  company_id: number;
  note: string | null;
}

// Product Types
export interface ProductPrice {
  id: number;
  product_id: number;
  price: number;
  currency: string;
  cost: number | null;
  overhead_cost: number | null;
  notes: string | null;
}

export interface ProductBase {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  unit: string | null;
  tax: number;
  category: string | null;
  active_flag: boolean;
  selectable: boolean;
  first_char: string;
  visible_to: VisibilityLevel;
  owner_id: number | UserReference;
  files_count: number | null;
  add_time: string;
  update_time: string;
  billing_frequency: string | null;
  billing_frequency_cycles: number | null;
  prices: ProductPrice[];
}

export type Product = ProductBase & CustomFields;

// Webhook Types
export interface Webhook {
  id: number;
  company_id: number;
  owner_id: number;
  user_id: number;
  event_action: string;
  event_object: string;
  subscription_url: string;
  version: string;
  is_active: number;
  add_time: string;
  remove_time: string | null;
  type: string;
  http_auth_user: string | null;
  http_auth_password: string | null;
  remove_reason: string | null;
  last_delivery_time: string | null;
  last_http_status: number | null;
  admin_id: number;
  name: string | null;
}

// Filter Types
export type FilterType = 'deals' | 'org' | 'people' | 'products' | 'activities';

export interface FilterConditionLeaf {
  object: string;
  field_id: string;
  operator: string;
  value?: string | number | boolean | null | Array<string | number>;
  extra_value?: string | number;
}

export interface FilterConditionGroup {
  glue: 'and' | 'or';
  conditions: Array<FilterConditionLeaf | FilterConditionGroup | null>;
}

export interface Filter {
  id: number;
  name: string;
  active_flag: boolean;
  type: FilterType;
  temporary_flag: boolean | null;
  user_id: number;
  add_time: string;
  update_time: string;
  visible_to: VisibilityLevel;
  custom_view_id: number | null;
  conditions?: FilterConditionGroup;
}

export interface FilterHelper {
  name: string;
  object: string;
  field: string;
  field_type: string;
  helper_type: string;
  input_type: string;
  options?: Array<{
    id: string | number;
    label: string;
  }>;
}

// Project Types
export interface ProjectBase {
  id: number;
  title: string;
  description: string | null;
  status: 'open' | 'completed' | 'canceled' | 'deleted';
  status_change_time: string | null;
  start_date: string | null;
  end_date: string | null;
  owner_id: number;
  add_time: string;
  update_time: string;
  labels: number[];
  archive_time: string | null;
  deal_ids: number[];
  person_id: number | null;
  org_id: number | null;
  board_id: number;
  phase_id: number;
}

export type Project = ProjectBase & CustomFields;

export interface ProjectBoard {
  id: number;
  name: string;
  order_nr: number;
  add_time: string;
  update_time: string;
}

export interface ProjectPhase {
  id: number;
  name: string;
  board_id: number;
  order_nr: number;
  add_time: string;
  update_time: string;
}

export interface ProjectTask {
  id: number;
  title: string;
  creator_id: number;
  description: string | null;
  done: boolean;
  due_date: string | null;
  parent_task_id: number | null;
  assignee_id: number | null;
  add_time: string;
  update_time: string;
  marked_as_done_time: string | null;
  project_id: number;
}

export interface ProjectGroup {
  id: number;
  name: string;
  order_nr: number;
}

export interface ProjectPlanItem {
  item_id: number;
  item_type: 'task' | 'activity';
  phase_id: number;
  group_id: number;
}

// Mailbox Types
export interface MailParty {
  id: number;
  email_address: string;
  name: string;
  linked_person_id: number | null;
  linked_person_name: string;
  mail_message_party_id: number;
}

export interface MailMessage {
  id: number;
  from: MailParty[];
  to: MailParty[];
  cc: MailParty[];
  bcc: MailParty[];
  body_url: string;
  account_id: string;
  user_id: number;
  mail_thread_id: number;
  subject: string;
  snippet: string;
  mail_tracking_status: string | null;
  mail_link_tracking_enabled_flag: number;
  read_flag: number;
  draft: string;
  draft_flag: number;
  synced_flag: number;
  deleted_flag: number;
  has_body_flag: number;
  sent_flag: number;
  sent_from_pipedrive_flag: number;
  smart_bcc_flag: number;
  message_time: string;
  add_time: string;
  update_time: string;
  has_attachments_flag: number;
  has_inline_attachments_flag: number;
  has_real_attachments_flag: number;
}

export interface MailThread {
  id: number;
  account_id: string;
  user_id: number;
  subject: string;
  snippet: string;
  read_flag: number;
  mail_tracking_status: string | null;
  has_attachments_flag: number;
  has_inline_attachments_flag: number;
  has_real_attachments_flag: number;
  deleted_flag: number;
  synced_flag: number;
  smart_bcc_flag: number;
  mail_link_tracking_enabled_flag: number;
  all_messages_sent_flag: number;
  first_message_to_cc: MailParty[];
  first_message_to_bcc: MailParty[];
  first_message_to_others: MailParty[];
  last_message_timestamp: string;
  first_message_timestamp: string;
  last_message_sent_timestamp: string | null;
  last_message_received_timestamp: string | null;
  add_time: string;
  update_time: string;
  deal_id: number | null;
  deal_status: string | null;
  lead_id: string | null;
  shared_flag: number;
  archived_flag: number;
  external_deleted_flag: number;
}

// Team Types
export interface Team {
  id: number;
  name: string;
  description: string;
  manager_id: number;
  users: number[];
  active_flag: number;
  deleted_flag: number;
  add_time: string;
  created_by_user_id: number;
}

// Organization Relationship Types
export interface OrganizationRelationship {
  id: number;
  type: string;
  rel_owner_org_id: OrganizationReference;
  rel_linked_org_id: OrganizationReference;
  add_time: string;
  update_time: string;
  active_flag: string | boolean;
  related_organization_name?: string;
  calculated_type?: string;
  calculated_related_org_id?: number;
}

// Permission Set Types
export interface PermissionSet {
  id: string; // UUID
  name: string;
  description: string;
  app: 'sales' | 'global' | 'account_settings' | string;
  type: 'admin' | 'regular' | 'custom';
  assignment_count: number;
  contents?: string[]; // Array of permission keys when fetching individual permission set
}

export interface PermissionSetAssignment {
  user_id: number;
  permission_set_id: string; // UUID
  name: string;
}

// Channel Types
export interface Channel {
  id: string;
  name: string;
  avatar_url?: string;
  provider_channel_id: string;
  marketplace_client_id: string;
  pd_company_id: number;
  pd_user_id: number;
  created_at: string;
  provider_type: 'other' | 'facebook' | 'instagram' | 'whatsapp' | 'telegram' | 'line' | 'viber';
  template_support: boolean;
}

export interface ChannelMessageAttachment {
  id: string;
  type: string;
  name: string;
  size: number;
  url: string;
  preview_url?: string;
  link_expires?: boolean;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  conversation_id: string;
  message: string;
  status: string;
  created_at: string;
  reply_by?: string;
  conversation_link?: string;
  attachments?: ChannelMessageAttachment[];
}
