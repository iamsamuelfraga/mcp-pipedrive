/**
 * Example usage patterns for Pipedrive validation schemas
 * This file demonstrates how to use the schemas in real-world scenarios
 */

import {
  CreateDealSchema,
  UpdateDealSchema,
  ListDealsSchema,
  SearchDealsSchema,
  type CreateDealInput,
  type UpdateDealInput,
} from './deal.js';

import { CreatePersonSchema, SearchPersonsSchema, type CreatePersonInput } from './person.js';

import { CreateOrganizationSchema, type CreateOrganizationInput } from './organization.js';

import {
  CreateActivitySchema,
  ListActivitiesSchema,
  type CreateActivityInput,
} from './activity.js';

import { UploadFileFromPathSchema, type UploadFileFromPathInput } from './file.js';

import { validate, validateStrict, formatZodError } from './validator.js';

// ============================================================================
// Example 1: Creating a Deal with Validation
// ============================================================================

export function exampleCreateDeal() {
  const dealData: CreateDealInput = {
    status: 'open',
    title: 'Enterprise Software License',
    value: 50000,
    currency: 'USD',
    person_id: 123,
    org_id: 456,
    stage_id: 2,
    expected_close_date: '2025-12-31',
    probability: 75,
  };

  // Validate using safe parse (recommended for external input)
  const result = validate(CreateDealSchema, dealData);

  if (result.success) {
    console.log('Valid deal data:', result.data);
    // Proceed with API call
    return result.data;
  } else {
    console.error('Validation errors:', formatZodError(result.error));
    throw new Error(`Invalid deal data: ${formatZodError(result.error)}`);
  }
}

// ============================================================================
// Example 2: Creating a Person with Email and Phone
// ============================================================================

export function exampleCreatePerson() {
  const personData: CreatePersonInput = {
    name: 'Jane Smith',
    email: [
      { value: 'jane.smith@company.com', primary: true, label: 'work' },
      { value: 'jane@personal.com', primary: false, label: 'personal' },
    ],
    phone: [
      { value: '+1-555-0123', primary: true, label: 'mobile' },
      { value: '+1-555-0124', primary: false, label: 'office' },
    ],
    org_id: 456,
    marketing_status: 'subscribed',
  };

  // Validate using strict parse (throws on error)
  try {
    const validPerson = validateStrict(CreatePersonSchema, personData);
    console.log('Valid person data:', validPerson);
    return validPerson;
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 3: Creating an Organization with Full Address
// ============================================================================

export function exampleCreateOrganization() {
  const orgData: CreateOrganizationInput = {
    name: 'Acme Corporation',
    address_street_number: '123',
    address_route: 'Main Street',
    address_locality: 'San Francisco',
    address_admin_area_level_1: 'California',
    address_country: 'United States',
    address_postal_code: '94102',
    address_formatted_address: '123 Main Street, San Francisco, CA 94102, USA',
    owner_id: 789,
    label: 1,
  };

  const validOrg = CreateOrganizationSchema.parse(orgData);
  return validOrg;
}

// ============================================================================
// Example 4: Creating an Activity with Participants
// ============================================================================

export function exampleCreateActivity() {
  const activityData: CreateActivityInput = {
    subject: 'Product Demo with Client',
    type: 'meeting',
    done: false,
    due_date: '2025-12-15',
    due_time: '14:30',
    duration: '01:30',
    deal_id: 789,
    person_id: 123,
    location: 'Zoom Meeting',
    note: 'Demonstrate new features and discuss pricing',
    participants: [
      { person_id: 123, primary_flag: true },
      { person_id: 124, primary_flag: false },
    ],
    attendees: [
      { email_address: 'jane@company.com', name: 'Jane Smith' },
      { email_address: 'john@company.com', name: 'John Doe' },
    ],
    busy_flag: true,
  };

  const validActivity = CreateActivitySchema.parse(activityData);
  return validActivity;
}

// ============================================================================
// Example 5: Searching for Deals with Filters
// ============================================================================

export function exampleSearchDeals() {
  const searchParams = {
    term: 'software',
    fields: 'title' as const,
    exact_match: false,
    status: 'open' as const,
    org_id: 456,
    start: 0,
    limit: 50,
  };

  const validSearch = SearchDealsSchema.parse(searchParams);
  return validSearch;
}

// ============================================================================
// Example 6: Listing Activities with Date Range
// ============================================================================

export function exampleListActivities() {
  const listParams = {
    user_id: 789,
    type: 'meeting' as const,
    done: false,
    start_date: '2025-12-01',
    end_date: '2025-12-31',
    start: 0,
    limit: 100,
    sort: 'due_date',
    sort_by: 'asc' as const,
  };

  const validList = ListActivitiesSchema.parse(listParams);
  return validList;
}

// ============================================================================
// Example 7: Updating a Deal
// ============================================================================

export function exampleUpdateDeal() {
  const updateData: UpdateDealInput = {
    id: 789,
    title: 'Updated Deal Title',
    value: 60000,
    stage_id: 3,
    probability: 85,
  };

  const validUpdate = UpdateDealSchema.parse(updateData);
  return validUpdate;
}

// ============================================================================
// Example 8: Uploading a File
// ============================================================================

export function exampleUploadFile() {
  const fileData: UploadFileFromPathInput = {
    file_path: '/path/to/contract.pdf',
    deal_id: 789,
  };

  const validFile = UploadFileFromPathSchema.parse(fileData);
  return validFile;
}

// ============================================================================
// Example 9: Listing Deals with Pagination and Filters
// ============================================================================

export function exampleListDeals() {
  const listParams = {
    status: 'all_not_deleted' as const,
    stage_id: 2,
    user_id: 789,
    start: 0,
    limit: 50,
    sort: 'value',
    sort_by: 'desc' as const,
  };

  const validList = ListDealsSchema.parse(listParams);
  return validList;
}

// ============================================================================
// Example 10: Error Handling Pattern
// ============================================================================

export function exampleErrorHandling(rawData: unknown) {
  const result = validate(CreateDealSchema, rawData);

  if (!result.success) {
    // Get detailed error information
    const errors = result.error.errors;

    console.error('Validation failed with the following errors:');
    errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });

    // Get formatted error message
    const formattedError = formatZodError(result.error);
    console.error('Formatted error:', formattedError);

    // Return structured error response
    return {
      success: false,
      errors: errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// ============================================================================
// Example 11: Type-Safe Function Signatures
// ============================================================================

export async function createDealTypeSafe(
  data: CreateDealInput
): Promise<{ id: number; title: string }> {
  // data is already typed as CreateDealInput
  // No need to validate again if coming from typed source

  // Simulate API call
  return {
    id: 123,
    title: data.title,
  };
}

export async function createDealFromUntrusted(
  data: unknown
): Promise<{ id: number; title: string }> {
  // Validate untrusted data
  const validData = validateStrict(CreateDealSchema, data);

  // Now validData is typed as CreateDealInput
  return {
    id: 123,
    title: validData.title,
  };
}

// ============================================================================
// Example 12: Partial Updates with Optional Fields
// ============================================================================

export function examplePartialUpdate() {
  // Only update specific fields
  const partialUpdate: UpdateDealInput = {
    id: 789,
    value: 75000, // Only updating value
  };

  const validUpdate = UpdateDealSchema.parse(partialUpdate);
  return validUpdate;
}

// ============================================================================
// Example 13: Complex Search with Multiple Filters
// ============================================================================

export function exampleComplexSearch() {
  const searchParams = {
    term: 'enterprise',
    fields: 'all' as const,
    exact_match: false,
    person_id: 123,
    org_id: 456,
    status: 'open' as const,
    start: 0,
    limit: 100,
  };

  const validSearch = SearchPersonsSchema.parse(searchParams);
  return validSearch;
}

// ============================================================================
// Example 14: Validation in API Handler
// ============================================================================

export async function apiHandlerExample(requestBody: unknown) {
  try {
    // Validate request body
    const validData = validateStrict(CreateDealSchema, requestBody);

    // Make API call with validated data
    // const result = await pipedriveApi.createDeal(validData);

    return {
      success: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}
