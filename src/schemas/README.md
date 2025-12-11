# Pipedrive MCP Server - Zod Validation Schemas

This directory contains comprehensive Zod validation schemas for all Pipedrive API operations in the MCP server.

## Directory Structure

```
src/schemas/
├── common.ts          # Reusable schema fragments (pagination, visibility, email, phone, etc.)
├── deal.ts            # Deal-related validation schemas
├── person.ts          # Person-related validation schemas
├── organization.ts    # Organization-related validation schemas
├── activity.ts        # Activity-related validation schemas
├── file.ts            # File upload and management schemas
├── validator.ts       # Validation utility functions
├── index.ts           # Central export file
└── README.md          # This file
```

## Schema Files

### common.ts
Contains reusable schema components used across multiple entities:

- **PaginationSchema** - Standard pagination parameters (start, limit)
- **VisibilitySchema** - Visibility levels ('1', '3', '5', '7')
- **EmailSchema** / **EmailItemSchema** - Email address validation with primary flag
- **PhoneSchema** / **PhoneItemSchema** - Phone number validation with labels
- **DealStatusSchema** - Deal status enumeration
- **MarketingStatusSchema** - Marketing consent status
- **CurrencySchema** - ISO 4217 currency codes
- **DateStringSchema** - YYYY-MM-DD date format
- **DateTimeStringSchema** - ISO 8601 datetime format
- **BooleanLikeSchema** - Flexible boolean handling (true/false, 0/1, "0"/"1")

### deal.ts
Deal-specific validation schemas:

- **CreateDealSchema** - Creating new deals
- **UpdateDealSchema** - Updating existing deals
- **ListDealsSchema** - Listing/filtering deals
- **SearchDealsSchema** - Searching for deals
- **MoveDealStageSchema** - Moving deals between stages
- **GetDealSchema** / **DeleteDealSchema** - Single deal operations
- **DuplicateDealSchema** - Duplicating deals
- **AddDealFollowerSchema** / **RemoveDealFollowerSchema** - Managing followers
- **GetDealProductsSchema** / **AddDealProductSchema** - Managing deal products
- **GetDealFilesSchema** / **AttachDealFileSchema** - Managing deal files

### person.ts
Person-specific validation schemas:

- **CreatePersonSchema** - Creating new persons
- **UpdatePersonSchema** - Updating existing persons
- **ListPersonsSchema** - Listing/filtering persons
- **SearchPersonsSchema** - Searching for persons
- **MergePersonsSchema** - Merging two persons
- **GetPersonDealsSchema** - Getting deals associated with a person
- **GetPersonActivitiesSchema** - Getting activities for a person
- **AddPersonFollowerSchema** / **RemovePersonFollowerSchema** - Managing followers

### organization.ts
Organization-specific validation schemas:

- **CreateOrganizationSchema** - Creating new organizations (with comprehensive address fields)
- **UpdateOrganizationSchema** - Updating existing organizations
- **ListOrganizationsSchema** - Listing/filtering organizations
- **SearchOrganizationsSchema** - Searching for organizations
- **MergeOrganizationsSchema** - Merging two organizations
- **GetOrganizationDealsSchema** - Getting deals for an organization
- **GetOrganizationPersonsSchema** - Getting persons in an organization
- **GetOrganizationActivitiesSchema** - Getting activities for an organization

### activity.ts
Activity-specific validation schemas:

- **ActivityTypeSchema** - Activity type enumeration (call, meeting, task, etc.)
- **CreateActivitySchema** - Creating new activities with required associations
- **UpdateActivitySchema** - Updating existing activities
- **ListActivitiesSchema** - Listing/filtering activities with date range validation
- **MarkActivityDoneSchema** / **MarkActivityUndoneSchema** - Completion status
- **BulkDeleteActivitiesSchema** / **BulkUpdateActivitiesSchema** - Bulk operations
- **GetActivitiesCollectionSchema** - Cursor-based pagination for activities

### file.ts
File management validation schemas:

- **UploadFileSchema** - Uploading files from Buffer
- **UploadFileFromPathSchema** - Uploading files from file system path
- **UpdateFileSchema** - Updating file metadata
- **ListFilesSchema** - Listing files with filters
- **SearchFilesSchema** - Searching files by name/type
- **LinkRemoteFileSchema** - Linking files from cloud storage (Google Drive, Dropbox, etc.)
- **UnlinkRemoteFileSchema** - Removing remote file links

## Usage Examples

### Basic Validation

```typescript
import { CreateDealSchema } from './schemas/deal.js';

const dealData = {
  title: 'New Deal',
  value: 1000,
  currency: 'USD',
  person_id: 123,
};

// Parse and validate
const validatedDeal = CreateDealSchema.parse(dealData);

// Safe parse (doesn't throw)
const result = CreateDealSchema.safeParse(dealData);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.error('Invalid:', result.error);
}
```

### Using TypeScript Types

```typescript
import { CreateDealInput, UpdateDealInput } from './schemas/deal.js';

function createDeal(data: CreateDealInput) {
  // data is fully typed
  console.log(data.title); // string
  console.log(data.value); // number | undefined
}

function updateDeal(data: UpdateDealInput) {
  // data is fully typed with id required
  console.log(data.id); // number
  console.log(data.title); // string | undefined
}
```

### Using Validation Utilities

```typescript
import { validate, validateStrict, formatZodError } from './schemas/validator.js';
import { CreatePersonSchema } from './schemas/person.js';

// Safe validation
const result = validate(CreatePersonSchema, personData);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
  const errorMessage = formatZodError(result.error);
  console.error(errorMessage);
}

// Strict validation (throws on error)
try {
  const validPerson = validateStrict(CreatePersonSchema, personData);
  // Use validPerson
} catch (error) {
  // Handle validation error
}
```

### Complex Validation Examples

#### Email and Phone Arrays

```typescript
import { CreatePersonSchema } from './schemas/person.js';

const personData = {
  name: 'John Doe',
  email: [
    { value: 'john@example.com', primary: true, label: 'work' },
    { value: 'john.doe@gmail.com', primary: false, label: 'personal' },
  ],
  phone: [
    { value: '+1-555-0123', primary: true, label: 'mobile' },
  ],
  org_id: 456,
};

const validPerson = CreatePersonSchema.parse(personData);
```

#### Activity with Validation Rules

```typescript
import { CreateActivitySchema } from './schemas/activity.js';

const activityData = {
  subject: 'Meeting with client',
  type: 'meeting',
  due_date: '2025-12-15',
  due_time: '14:30',
  duration: '01:00',
  deal_id: 789,
  location: 'Conference Room A',
  participants: [
    { person_id: 123, primary_flag: true },
  ],
};

// Validates that at least one association (deal_id, person_id, org_id) is provided
const validActivity = CreateActivitySchema.parse(activityData);
```

#### File Upload

```typescript
import { UploadFileSchema } from './schemas/file.js';
import fs from 'fs';

const fileBuffer = fs.readFileSync('/path/to/file.pdf');

const fileData = {
  file: fileBuffer,
  file_name: 'contract.pdf',
  deal_id: 123,
};

const validFile = UploadFileSchema.parse(fileData);
```

#### Search with Filters

```typescript
import { SearchDealsSchema } from './schemas/deal.js';

const searchParams = {
  term: 'enterprise',
  fields: 'title',
  exact_match: false,
  status: 'open',
  start: 0,
  limit: 50,
};

const validSearch = SearchDealsSchema.parse(searchParams);
```

## Validation Features

### Built-in Validations

- **String length** - min/max character limits
- **Number ranges** - min/max values, positive, non-negative
- **Email validation** - RFC-compliant email format
- **URL validation** - Valid URL format
- **Date formats** - YYYY-MM-DD and ISO 8601
- **Time formats** - HH:MM (24-hour)
- **Enum validation** - Strict allowed values
- **Custom refinements** - Cross-field validation rules

### Custom Refinements

Several schemas include custom validation logic:

- **MergePersonsSchema** / **MergeOrganizationsSchema** - Prevents merging entity with itself
- **CreateActivitySchema** - Requires at least one association (deal/person/org)
- **UploadFileSchema** - Requires at least one entity association
- **ListActivitiesSchema** - Validates start_date <= end_date

### Error Messages

All schemas include descriptive error messages:

```typescript
const result = CreateDealSchema.safeParse({ title: '' });
// Error: "Title is required and cannot be empty"

const result2 = CreateDealSchema.safeParse({
  title: 'Deal',
  value: -100,
});
// Error: "Value must be non-negative"
```

## Best Practices

1. **Always validate at boundaries** - Validate all external input before processing
2. **Use TypeScript types** - Export and use inferred types for type safety
3. **Handle errors gracefully** - Use `safeParse()` for user input, `parse()` for internal data
4. **Provide context** - Use `formatZodError()` to give users clear error messages
5. **Reuse common schemas** - Import from `common.ts` for consistency
6. **Document custom fields** - Add `.describe()` for all custom/optional fields

## Integration with MCP Server

These schemas should be integrated into the MCP server tool handlers:

```typescript
import { CreateDealSchema } from './schemas/deal.js';
import { validate, formatZodError } from './schemas/validator.js';

// In your tool handler
async function handleCreateDeal(params: unknown) {
  const result = validate(CreateDealSchema, params);

  if (!result.success) {
    throw new Error(`Validation failed: ${formatZodError(result.error)}`);
  }

  // Use result.data for the API call
  const deal = await pipedriveApi.createDeal(result.data);
  return deal;
}
```

## Testing

Test your schemas with various inputs:

```typescript
import { describe, it, expect } from 'vitest';
import { CreateDealSchema } from './schemas/deal.js';

describe('CreateDealSchema', () => {
  it('should validate valid deal data', () => {
    const data = {
      title: 'Test Deal',
      value: 1000,
      currency: 'USD',
    };

    const result = CreateDealSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid currency code', () => {
    const data = {
      title: 'Test Deal',
      currency: 'US', // Invalid - must be 3 chars
    };

    const result = CreateDealSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

## Additional Resources

- [Zod Documentation](https://zod.dev/)
- [Pipedrive API Reference](https://developers.pipedrive.com/docs/api/v1)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
