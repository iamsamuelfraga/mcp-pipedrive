/**
 * Mock data for testing Pipedrive entities
 * These represent realistic examples of data returned from the Pipedrive API
 */

/**
 * Mock Deal data
 */
export const mockDeal = {
  id: 1,
  title: 'Enterprise Software License',
  value: 50000,
  currency: 'USD',
  status: 'open',
  stage_id: 1,
  pipeline_id: 1,
  user_id: 1,
  person_id: 101,
  org_id: 201,
  expected_close_date: '2025-12-31',
  probability: 75,
  add_time: '2025-01-15T10:30:00Z',
  update_time: '2025-01-20T14:45:00Z',
  visible_to: '3',
  owner_name: 'John Doe',
  person_name: 'Jane Smith',
  org_name: 'Acme Corporation',
  stage_name: 'Proposal',
  pipeline_name: 'Sales Pipeline',
  won_time: null,
  lost_time: null,
  close_time: null,
  lost_reason: null,
  activities_count: 5,
  done_activities_count: 3,
  undone_activities_count: 2,
  files_count: 2,
  notes_count: 4,
  followers_count: 3,
  email_messages_count: 8,
  participants_count: 2,
  deleted: false,
  active: true,
};

export const mockDeals = [
  mockDeal,
  {
    ...mockDeal,
    id: 2,
    title: 'SaaS Subscription - Annual',
    value: 25000,
    stage_id: 2,
    probability: 90,
    person_id: 102,
    org_id: 202,
  },
  {
    ...mockDeal,
    id: 3,
    title: 'Consulting Services',
    value: 15000,
    stage_id: 3,
    probability: 50,
    status: 'won',
    won_time: '2025-01-18T16:00:00Z',
  },
];

/**
 * Mock Person data
 */
export const mockPerson = {
  id: 101,
  name: 'Jane Smith',
  first_name: 'Jane',
  last_name: 'Smith',
  owner_id: 1,
  org_id: 201,
  email: [
    {
      value: 'jane.smith@acme.com',
      primary: true,
      label: 'work',
    },
    {
      value: 'jane.personal@example.com',
      primary: false,
      label: 'personal',
    },
  ],
  phone: [
    {
      value: '+1-555-0123',
      primary: true,
      label: 'work',
    },
    {
      value: '+1-555-0124',
      primary: false,
      label: 'mobile',
    },
  ],
  visible_to: '3',
  marketing_status: 'subscribed',
  add_time: '2024-06-15T09:00:00Z',
  update_time: '2025-01-15T11:20:00Z',
  active_flag: true,
  picture_id: {
    value: 1001,
  },
  open_deals_count: 2,
  closed_deals_count: 5,
  won_deals_count: 4,
  lost_deals_count: 1,
  activities_count: 12,
  done_activities_count: 8,
  undone_activities_count: 4,
  files_count: 3,
  notes_count: 6,
  followers_count: 2,
  email_messages_count: 15,
};

export const mockPersons = [
  mockPerson,
  {
    ...mockPerson,
    id: 102,
    name: 'Bob Johnson',
    first_name: 'Bob',
    last_name: 'Johnson',
    org_id: 202,
    email: [
      {
        value: 'bob.johnson@techcorp.com',
        primary: true,
        label: 'work',
      },
    ],
    phone: [
      {
        value: '+1-555-0125',
        primary: true,
        label: 'work',
      },
    ],
  },
  {
    ...mockPerson,
    id: 103,
    name: 'Alice Williams',
    first_name: 'Alice',
    last_name: 'Williams',
    org_id: 203,
    email: [
      {
        value: 'alice.w@startup.io',
        primary: true,
        label: 'work',
      },
    ],
  },
];

/**
 * Mock Organization data
 */
export const mockOrganization = {
  id: 201,
  name: 'Acme Corporation',
  owner_id: 1,
  address: '123 Main Street',
  address_subpremise: 'Suite 400',
  address_street_number: '123',
  address_route: 'Main Street',
  address_locality: 'New York',
  address_admin_area_level_1: 'NY',
  address_country: 'United States',
  address_postal_code: '10001',
  address_formatted_address: '123 Main Street, Suite 400, New York, NY 10001, USA',
  visible_to: '3',
  add_time: '2024-01-10T08:00:00Z',
  update_time: '2025-01-10T10:00:00Z',
  active_flag: true,
  picture_id: {
    value: 2001,
  },
  people_count: 5,
  open_deals_count: 3,
  closed_deals_count: 10,
  won_deals_count: 8,
  lost_deals_count: 2,
  activities_count: 25,
  done_activities_count: 18,
  undone_activities_count: 7,
  files_count: 8,
  notes_count: 12,
  followers_count: 4,
  email_messages_count: 30,
};

export const mockOrganizations = [
  mockOrganization,
  {
    ...mockOrganization,
    id: 202,
    name: 'TechCorp Industries',
    address: '456 Tech Boulevard',
    address_locality: 'San Francisco',
    address_admin_area_level_1: 'CA',
    address_postal_code: '94105',
  },
  {
    ...mockOrganization,
    id: 203,
    name: 'Startup.io',
    address: '789 Innovation Drive',
    address_locality: 'Austin',
    address_admin_area_level_1: 'TX',
    address_postal_code: '78701',
  },
];

/**
 * Mock Activity data
 */
export const mockActivity = {
  id: 301,
  subject: 'Product Demo Call',
  type: 'call',
  due_date: '2025-12-15',
  due_time: '14:00',
  duration: '01:00',
  user_id: 1,
  deal_id: 1,
  person_id: 101,
  org_id: 201,
  location: 'Video Conference',
  note: 'Discuss enterprise features and pricing',
  public_description: 'Product demonstration session',
  done: false,
  busy_flag: true,
  add_time: '2025-01-10T09:00:00Z',
  update_time: '2025-01-15T10:30:00Z',
  active_flag: true,
  marked_as_done_time: null,
  participants: [
    {
      person_id: 101,
      primary_flag: true,
    },
  ],
  attendees: [
    {
      email_address: 'jane.smith@acme.com',
      name: 'Jane Smith',
    },
  ],
  owner_name: 'John Doe',
  person_name: 'Jane Smith',
  org_name: 'Acme Corporation',
  deal_title: 'Enterprise Software License',
};

export const mockActivities = [
  mockActivity,
  {
    ...mockActivity,
    id: 302,
    subject: 'Follow-up Email',
    type: 'email',
    due_date: '2025-12-16',
    due_time: '10:00',
    duration: '00:30',
    done: true,
    marked_as_done_time: '2025-01-16T11:00:00Z',
  },
  {
    ...mockActivity,
    id: 303,
    subject: 'Contract Review Meeting',
    type: 'meeting',
    due_date: '2025-12-20',
    due_time: '15:30',
    duration: '02:00',
    location: 'Conference Room A',
  },
];

/**
 * Mock Pipeline data
 */
export const mockPipeline = {
  id: 1,
  name: 'Sales Pipeline',
  url_title: 'sales-pipeline',
  order_nr: 1,
  active: true,
  deal_probability: true,
  add_time: '2024-01-01T00:00:00Z',
  update_time: '2025-01-01T00:00:00Z',
  selected: true,
};

export const mockPipelines = [
  mockPipeline,
  {
    ...mockPipeline,
    id: 2,
    name: 'Support Pipeline',
    url_title: 'support-pipeline',
    order_nr: 2,
    selected: false,
  },
];

/**
 * Mock Stage data
 */
export const mockStage = {
  id: 1,
  name: 'Proposal',
  pipeline_id: 1,
  deal_probability: 75,
  rotten_flag: false,
  rotten_days: 30,
  add_time: '2024-01-01T00:00:00Z',
  update_time: '2025-01-01T00:00:00Z',
  active_flag: true,
  order_nr: 1,
};

export const mockStages = [
  mockStage,
  {
    ...mockStage,
    id: 2,
    name: 'Negotiation',
    deal_probability: 90,
    order_nr: 2,
  },
  {
    ...mockStage,
    id: 3,
    name: 'Closed Won',
    deal_probability: 100,
    order_nr: 3,
  },
];

/**
 * Mock User data
 */
export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@company.com',
  active_flag: true,
  is_admin: true,
  created: '2023-01-01T00:00:00Z',
  modified: '2025-01-01T00:00:00Z',
  timezone_name: 'America/New_York',
  timezone_offset: '-05:00',
  locale: 'en_US',
  lang: 1,
  phone: '+1-555-0100',
  role_id: 1,
  icon_url: 'https://example.com/avatar.jpg',
  has_created_company: true,
  is_you: true,
};

export const mockUsers = [
  mockUser,
  {
    ...mockUser,
    id: 2,
    name: 'Sarah Manager',
    email: 'sarah.manager@company.com',
    is_admin: false,
    is_you: false,
  },
];

/**
 * Mock File data
 */
export const mockFile = {
  id: 401,
  name: 'proposal.pdf',
  file_name: 'proposal.pdf',
  file_size: 524288,
  file_type: 'pdf',
  add_time: '2025-01-15T12:00:00Z',
  update_time: '2025-01-15T12:00:00Z',
  person_id: 101,
  org_id: 201,
  deal_id: 1,
  product_id: null,
  active_flag: true,
  inline_flag: false,
  remote_location: 's3',
  remote_id: 'abc123',
  url: 'https://files.pipedrive.com/proposal.pdf',
  s3_bucket: 'pipedrive-files',
  cid: null,
  user_id: 1,
};

export const mockFiles = [
  mockFile,
  {
    ...mockFile,
    id: 402,
    name: 'contract.docx',
    file_name: 'contract.docx',
    file_type: 'docx',
    file_size: 102400,
  },
];

/**
 * Mock Note data
 */
export const mockNote = {
  id: 501,
  content: 'Customer expressed strong interest in enterprise features',
  add_time: '2025-01-15T14:30:00Z',
  update_time: '2025-01-15T14:30:00Z',
  user_id: 1,
  deal_id: 1,
  person_id: 101,
  org_id: 201,
  lead_id: null,
  active_flag: true,
  pinned_to_deal_flag: false,
  pinned_to_organization_flag: false,
  pinned_to_person_flag: false,
  pinned_to_lead_flag: false,
  user: {
    email: 'john.doe@company.com',
    name: 'John Doe',
    icon_url: 'https://example.com/avatar.jpg',
    is_you: true,
  },
  organization: {
    name: 'Acme Corporation',
  },
  person: {
    name: 'Jane Smith',
  },
  deal: {
    title: 'Enterprise Software License',
  },
};

export const mockNotes = [
  mockNote,
  {
    ...mockNote,
    id: 502,
    content: 'Follow-up scheduled for next week',
    add_time: '2025-01-16T10:00:00Z',
  },
];

/**
 * Mock Product data
 */
export const mockProduct = {
  id: 601,
  name: 'Enterprise License',
  code: 'ENT-LIC-001',
  description: 'Annual enterprise software license',
  unit: 'licenses',
  tax: 0,
  active_flag: true,
  selectable: true,
  visible_to: '3',
  owner_id: 1,
  add_time: '2024-01-01T00:00:00Z',
  update_time: '2025-01-01T00:00:00Z',
  prices: [
    {
      id: 1,
      product_id: 601,
      price: 50000,
      currency: 'USD',
      cost: 25000,
      overhead_cost: 5000,
    },
  ],
  files_count: 1,
  followers_count: 2,
};

export const mockProducts = [
  mockProduct,
  {
    ...mockProduct,
    id: 602,
    name: 'Professional License',
    code: 'PRO-LIC-001',
    prices: [
      {
        id: 2,
        product_id: 602,
        price: 25000,
        currency: 'USD',
        cost: 12500,
        overhead_cost: 2500,
      },
    ],
  },
];

/**
 * Mock Search Results
 */
export const mockSearchResults = {
  deals: {
    items: mockDeals.slice(0, 2),
    total_count: 2,
  },
  persons: {
    items: mockPersons.slice(0, 2),
    total_count: 2,
  },
  organizations: {
    items: mockOrganizations.slice(0, 2),
    total_count: 2,
  },
};

/**
 * Mock Pagination data
 */
export const mockPagination = {
  start: 0,
  limit: 50,
  more_items_in_collection: false,
  next_start: undefined,
};

export const mockPaginationWithMore = {
  start: 0,
  limit: 50,
  more_items_in_collection: true,
  next_start: 50,
};
