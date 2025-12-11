# Custom Fields Guide

Custom fields in Pipedrive allow you to extend the standard data model with fields specific to your business. This guide explains how to discover, understand, and use custom fields with the MCP server.

## Table of Contents

- [What Are Custom Fields?](#what-are-custom-fields)
- [Discovering Custom Fields](#discovering-custom-fields)
- [Field Types](#field-types)
- [Using Custom Fields](#using-custom-fields)
- [Field Keys vs Field Names](#field-keys-vs-field-names)
- [Examples by Entity Type](#examples-by-entity-type)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## What Are Custom Fields?

Custom fields are user-defined fields that extend Pipedrive's standard entities (Deals, Persons, Organizations, Activities, Products). They allow you to track information specific to your business processes.

### Why Use Custom Fields?

- **Business-Specific Data**: Track industry-specific information
- **Qualification Criteria**: BANT, MEDDIC, or custom qualification frameworks
- **Segmentation**: Categorize records for reporting and filtering
- **Integration Data**: Store IDs from other systems
- **Custom Workflows**: Enable business-specific processes

### Standard vs Custom Fields

**Standard Fields** (always available):
- Deal: `title`, `value`, `currency`, `stage_id`, `person_id`, `org_id`
- Person: `name`, `email`, `phone`, `org_id`
- Organization: `name`, `address`, `owner_id`

**Custom Fields** (defined by your organization):
- Industry, Company Size, Lead Source, Budget, Timeline, etc.
- Stored with hash keys like `abc123def456`

## Discovering Custom Fields

### Method 1: Using MCP Resources (Recommended)

The fastest way to see all custom fields:

**Prompt to Claude:**
```
Show me all custom fields available in Pipedrive.
```

Claude will access the `pipedrive://custom-fields` resource, which returns:

```json
{
  "deals": [...],
  "persons": [...],
  "organizations": [...],
  "activities": [...]
}
```

### Method 2: Using Field Tools

For entity-specific fields:

```
Show me all custom fields for deals.
```

This uses the `fields/deal-fields` tool and returns detailed field metadata.

### What You'll See

Each field has:
- **id**: Numeric field ID
- **key**: Hash key used in API calls (e.g., `abc123def456`)
- **name**: Human-readable name (e.g., "Industry")
- **field_type**: Data type (text, varchar, enum, etc.)
- **options**: Available options for dropdown/multi-select fields
- **mandatory_flag**: Whether the field is required
- **edit_flag**: Whether the field can be edited
- **details**: Type-specific configuration

## Field Types

Pipedrive supports various field types, each with specific validation and usage:

### 1. Text Fields

**Types**: `text`, `varchar`

Long-form or short text content.

```json
{
  "id": 12345,
  "key": "abc123",
  "name": "Notes",
  "field_type": "text"
}
```

**Usage:**
```json
{
  "abc123": "This is my custom note content"
}
```

**Validation:**
- `varchar`: Limited length (usually 255 characters)
- `text`: Longer content allowed

### 2. Numeric Fields

**Types**: `int`, `double`, `monetary`

Numbers, decimals, or currency values.

```json
{
  "id": 12346,
  "key": "def456",
  "name": "Employee Count",
  "field_type": "int"
}
```

**Usage:**
```json
{
  "def456": 250
}
```

**Validation:**
- `int`: Whole numbers only
- `double`: Decimal numbers allowed
- `monetary`: Currency values (respect currency settings)

### 3. Date Fields

**Types**: `date`, `datetime`, `time`

Date, time, or datetime values.

```json
{
  "id": 12347,
  "key": "ghi789",
  "name": "Contract Start Date",
  "field_type": "date"
}
```

**Usage:**
```json
{
  "ghi789": "2025-12-10"
}
```

**Format:**
- `date`: `YYYY-MM-DD`
- `time`: `HH:MM:SS`
- `datetime`: `YYYY-MM-DD HH:MM:SS`

### 4. Dropdown (Single Select)

**Type**: `enum`, `set`

Select one option from a predefined list.

```json
{
  "id": 12348,
  "key": "jkl012",
  "name": "Industry",
  "field_type": "enum",
  "options": [
    { "id": 1, "label": "Technology" },
    { "id": 2, "label": "Healthcare" },
    { "id": 3, "label": "Finance" },
    { "id": 4, "label": "Retail" }
  ]
}
```

**Usage (by option ID):**
```json
{
  "jkl012": 1
}
```

**Usage (by label - Claude handles conversion):**
```
Set Industry to Technology
```

### 5. Multi-Select

**Type**: `set` (with `use_field_value: true`)

Select multiple options from a list.

```json
{
  "id": 12349,
  "key": "mno345",
  "name": "Products Interested In",
  "field_type": "set",
  "options": [
    { "id": 1, "label": "Product A" },
    { "id": 2, "label": "Product B" },
    { "id": 3, "label": "Product C" }
  ]
}
```

**Usage:**
```json
{
  "mno345": [1, 3]
}
```

Or as comma-separated:
```json
{
  "mno345": "1,3"
}
```

### 6. User Fields

**Type**: `user`

Reference to a Pipedrive user.

```json
{
  "id": 12350,
  "key": "pqr678",
  "name": "Account Manager",
  "field_type": "user"
}
```

**Usage:**
```json
{
  "pqr678": 123
}
```

Where `123` is the user ID.

### 7. Organization/Person Fields

**Type**: `org`, `person`

Reference to another entity in Pipedrive.

```json
{
  "id": 12351,
  "key": "stu901",
  "name": "Referred By",
  "field_type": "person"
}
```

**Usage:**
```json
{
  "stu901": 456
}
```

### 8. Phone, Email, Address

**Types**: `phone`, `email`, `address`

Special formatted text fields.

```json
{
  "id": 12352,
  "key": "vwx234",
  "name": "Support Phone",
  "field_type": "phone"
}
```

**Usage:**
```json
{
  "vwx234": "+1-555-123-4567"
}
```

### 9. Yes/No Fields

**Type**: `varchar` with specific options

Binary choice fields.

```json
{
  "id": 12353,
  "key": "yza567",
  "name": "Qualified Lead",
  "field_type": "varchar",
  "options": [
    { "id": 1, "label": "Yes" },
    { "id": 2, "label": "No" }
  ]
}
```

**Usage:**
```json
{
  "yza567": 1
}
```

## Using Custom Fields

### Step 1: Discover Available Fields

**Ask Claude:**
```
What custom fields are available for deals?
```

Claude will show you all fields with their keys and types.

### Step 2: Create/Update with Custom Fields

**Natural Language (Recommended):**
```
Create a deal titled "Acme Corp Deal" worth $50,000.
Set Industry to Technology and Lead Source to Website.
```

Claude will:
1. Discover the field keys for "Industry" and "Lead Source"
2. Map "Technology" to its option ID
3. Include custom fields in the create request

**Explicit (Advanced):**
```json
{
  "title": "Acme Corp Deal",
  "value": 50000,
  "currency": "USD",
  "abc123": 1,
  "def456": "Website"
}
```

### Step 3: Read Custom Field Values

When you get an entity, custom fields are included:

```
Get deal #12345
```

Response includes:
```json
{
  "id": 12345,
  "title": "Acme Corp Deal",
  "value": 50000,
  "abc123": "Technology",
  "def456": "Website"
}
```

## Field Keys vs Field Names

Pipedrive uses hash keys for custom fields in API calls, but displays human-readable names in the UI.

### The Mapping

- **UI Name**: "Industry" (what you see in Pipedrive)
- **API Key**: `abc123def456` (what the API uses)
- **Field ID**: `12348` (numeric identifier)

### How Claude Handles This

Claude automatically maps between names and keys:

**You say:**
```
Set Industry to Technology
```

**Claude translates to:**
```json
{
  "abc123def456": 1
}
```

**You don't need to know the key!**

### Manual Mapping (If Needed)

If you're building API requests manually:

1. Get fields: `fields/deal-fields`
2. Find your field by name
3. Use the `key` value in your request
4. For dropdowns, use option `id` not `label`

## Examples by Entity Type

### Deal Custom Fields

**Common Deal Fields:**
- Lead Source (dropdown)
- Industry (dropdown)
- Budget Authority (yes/no)
- Decision Timeline (date)
- Competitor (text)
- Deal Size Category (dropdown)

**Example:**
```
Create a deal for "Enterprise Software Sale" with:
- Value: $100,000
- Industry: Technology
- Lead Source: Referral
- Decision Timeline: End of Q1 2025
- Competitor: Salesforce
```

**API Equivalent:**
```json
{
  "title": "Enterprise Software Sale",
  "value": 100000,
  "currency": "USD",
  "abc123": 1,
  "def456": 3,
  "ghi789": "2025-03-31",
  "jkl012": "Salesforce"
}
```

### Person Custom Fields

**Common Person Fields:**
- Job Title (text)
- Department (dropdown)
- LinkedIn URL (text)
- Birthday (date)
- Preferred Contact Method (dropdown)
- VIP Status (yes/no)

**Example:**
```
Create a contact:
- Name: Sarah Johnson
- Email: sarah@techcorp.com
- Job Title: VP of Sales
- Department: Sales
- LinkedIn: linkedin.com/in/sarahjohnson
- VIP Status: Yes
```

### Organization Custom Fields

**Common Organization Fields:**
- Company Size (dropdown)
- Industry (dropdown)
- Annual Revenue (monetary)
- Website (text)
- Founded Year (integer)
- Customer Since (date)

**Example:**
```
Create organization TechCorp with:
- Company Size: 200-500 employees
- Industry: Technology
- Annual Revenue: $50M
- Website: techcorp.com
- Founded Year: 2010
```

### Activity Custom Fields

**Common Activity Fields:**
- Meeting Type (dropdown: Discovery, Demo, Negotiation)
- Call Outcome (dropdown: Connected, Voicemail, No Answer)
- Follow-up Required (yes/no)
- Meeting Location (text)

**Example:**
```
Create a call activity:
- Subject: Discovery Call
- Due Date: Tomorrow at 2pm
- Meeting Type: Discovery
- Duration: 30 minutes
```

## Best Practices

### 1. Understand Your Fields Before Using

Always check available fields first:
```
Show me custom fields for [entity type]
```

### 2. Use Natural Language

Let Claude handle field mapping:
```
Set Industry to Technology
```

Instead of:
```
Set abc123 to 1
```

### 3. Validate Dropdown Options

For dropdown fields, use valid option labels:
```
Show me options for the Industry field on deals.
```

### 4. Handle Required Fields

Check which fields are mandatory:
```
Which deal fields are required?
```

### 5. Consistent Data Entry

Use consistent values for text fields:
- ✅ "Technology", "technology", "tech" → Pick one
- ✅ Use dropdown fields for consistency when possible

### 6. Date Format Consistency

Always use ISO format for dates:
- ✅ `2025-12-10`
- ❌ `12/10/2025`
- ❌ `10-Dec-2025`

### 7. Update Fields Individually

You can update just custom fields:
```
Update deal #12345: Set Lead Source to Webinar
```

### 8. Bulk Field Updates

Be cautious with bulk updates:
```
For all deals in Negotiation stage, set Budget Approved to Yes
```

Claude will confirm before making bulk changes.

## Troubleshooting

### Field Not Found

**Error:**
```
Field 'Industry' not found
```

**Solution:**
1. Verify the field exists: `fields/deal-fields`
2. Check exact spelling and capitalization
3. Confirm you're using the right entity type (deal/person/org)

### Invalid Option Value

**Error:**
```
Invalid option value for field 'Industry'
```

**Solution:**
1. Get valid options: Show field details
2. Use exact option label
3. Check for spelling/capitalization

### Field Not Editable

**Error:**
```
Field 'xyz' is not editable
```

**Solution:**
- Check field's `edit_flag` in field details
- Some system fields are read-only
- Contact Pipedrive admin to change field settings

### Type Mismatch

**Error:**
```
Expected number, received string
```

**Solution:**
- Check field type in field metadata
- Use correct data type (number for int/double, string for text)
- Use option ID (number) for dropdowns, not label (string)

### Required Field Missing

**Error:**
```
Required field 'xyz' is missing
```

**Solution:**
1. Check mandatory fields: `fields/deal-fields`
2. Include all required fields in create/update
3. Required fields have `mandatory_flag: true`

### Field Key vs Field Name

**Error:**
```
Unknown field: abc123
```

**Solution:**
- When using natural language, use field names not keys
- Claude maps names to keys automatically
- If manually building requests, verify key from field metadata

## Advanced Usage

### Conditional Field Updates

```
If a deal's value exceeds $100,000, set it as VIP Deal = Yes
and assign it to the Senior Sales team.
```

### Field-Based Filtering

```
Find all deals where:
- Industry is Technology
- Lead Source is Webinar
- Created in the last 30 days
```

### Multi-Field Updates

```
Update deal #12345:
- Move to Negotiation stage
- Set Decision Timeline to end of month
- Set Budget Approved to Yes
- Set Competitor to None
```

### Field Value Calculations

```
For all won deals this quarter, show me the breakdown by Industry
and Lead Source.
```

## Reference

### Get All Fields

```bash
# Deals
fields/deal-fields

# Persons
fields/person-fields

# Organizations
fields/org-fields

# Activities
fields/activity-fields

# Products
fields/product-fields

# All at once
Access resource: pipedrive://custom-fields
```

### Get Specific Field

```bash
fields/get-field: {
  id: 12345
}
```

### Field Metadata Structure

```json
{
  "id": 12345,
  "key": "abc123def456",
  "name": "Industry",
  "field_type": "enum",
  "mandatory_flag": false,
  "edit_flag": true,
  "options": [
    {
      "id": 1,
      "label": "Technology"
    }
  ]
}
```

## Need More Help?

- **Field Setup**: Contact your Pipedrive admin
- **Field Types**: [Pipedrive Field Type Documentation](https://support.pipedrive.com/en/article/custom-fields)
- **API Reference**: [Pipedrive API - Fields](https://developers.pipedrive.com/docs/api/v1/DealFields)
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
