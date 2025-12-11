# Common Workflows

This guide provides step-by-step examples of common Pipedrive workflows using the MCP server with Claude. Each workflow includes the natural language prompt you can use and explains what happens behind the scenes.

## Table of Contents

1. [Lead Capture and Qualification](#1-lead-capture-and-qualification)
2. [Deal Creation with Full Context](#2-deal-creation-with-full-context)
3. [Sales Pipeline Management](#3-sales-pipeline-management)
4. [Activity Management and Follow-ups](#4-activity-management-and-follow-ups)
5. [Contact Organization](#5-contact-organization)
6. [File and Document Management](#6-file-and-document-management)
7. [Reporting and Analytics](#7-reporting-and-analytics)
8. [Lost Deal Analysis](#8-lost-deal-analysis)
9. [Team Collaboration](#9-team-collaboration)
10. [Bulk Operations](#10-bulk-operations)
11. [Pipeline Health Check](#11-pipeline-health-check)
12. [Customer Onboarding](#12-customer-onboarding)

---

## 1. Lead Capture and Qualification

### Scenario
You received a new lead from a trade show. You need to add them to Pipedrive, qualify them, and schedule a follow-up.

### Prompt

```
I met Sarah Johnson (sarah.johnson@techcorp.com) from TechCorp at the conference.
She's interested in our Enterprise plan. Create a contact for her and her company,
then create a qualified deal and schedule a discovery call for next Tuesday at 2 PM.
```

### What Happens

1. **Search for existing contact**
   ```
   persons/search: { term: "sarah.johnson@techcorp.com" }
   ```

2. **Create organization if needed**
   ```
   organizations/create: {
     name: "TechCorp"
   }
   ```

3. **Create person**
   ```
   persons/create: {
     name: "Sarah Johnson",
     email: "sarah.johnson@techcorp.com",
     org_id: <org_id>
   }
   ```

4. **Create qualified deal**
   ```
   deals/create: {
     title: "TechCorp - Enterprise Plan",
     person_id: <person_id>,
     org_id: <org_id>,
     value: 50000,
     currency: "USD"
   }
   ```

5. **Schedule discovery call**
   ```
   activities/create: {
     subject: "Discovery call with Sarah Johnson",
     type: "call",
     due_date: "2025-12-17",
     due_time: "14:00",
     deal_id: <deal_id>,
     person_id: <person_id>
   }
   ```

### Expected Result

Claude provides a summary:
- Contact and company created (or found existing)
- Deal ID and current stage
- Activity scheduled with confirmation
- Next steps and recommendations

---

## 2. Deal Creation with Full Context

### Scenario
Creating a comprehensive deal with all relevant information including custom fields, expected close date, and initial notes.

### Prompt

```
Create a new deal:
- Title: "Q1 2025 Software License Renewal"
- Company: Acme Corp
- Contact: John Doe (john@acme.com)
- Value: $75,000
- Expected close: End of January 2025
- Add a note: "Existing customer, up for renewal. They mentioned interest in upgrading to Premium tier."
- Priority: High
```

### What Happens

1. **Discover available custom fields**
   ```
   Access resource: pipedrive://custom-fields
   ```

2. **Find or create organization**
   ```
   organizations/search: { term: "Acme Corp" }
   // or organizations/create
   ```

3. **Find or create person**
   ```
   persons/search: { term: "john@acme.com" }
   // or persons/create
   ```

4. **Create deal with all details**
   ```
   deals/create: {
     title: "Q1 2025 Software License Renewal",
     value: 75000,
     currency: "USD",
     person_id: <person_id>,
     org_id: <org_id>,
     expected_close_date: "2025-01-31",
     // Custom fields if priority field exists
   }
   ```

5. **Add note**
   ```
   notes/create: {
     content: "Existing customer, up for renewal...",
     deal_id: <deal_id>
   }
   ```

### Best Practices

- Always search before creating to avoid duplicates
- Check custom fields to ensure you're using available fields
- Add notes for context that doesn't fit in standard fields
- Set realistic expected close dates

---

## 3. Sales Pipeline Management

### Scenario
Moving deals through your pipeline and updating their status as they progress.

### Prompt

```
Show me all deals in the "Proposal Sent" stage. For the Acme Corp deal,
move it to "Negotiation" stage and update the probability to 75%.
Also update the expected close date to two weeks from now.
```

### What Happens

1. **Get pipeline structure**
   ```
   Access resource: pipedrive://pipelines
   ```

2. **List deals in specific stage**
   ```
   deals/list: {
     stage_id: <proposal_sent_stage_id>
   }
   ```

3. **Find target deal**
   ```
   search/deals: { term: "Acme Corp" }
   ```

4. **Update deal**
   ```
   deals/update: {
     id: <deal_id>,
     stage_id: <negotiation_stage_id>,
     probability: 75,
     expected_close_date: "2025-12-24"
   }
   ```

### Pipeline Movement Tips

- Understand your pipeline stages before moving deals
- Update probability as deals progress
- Adjust expected close dates realistically
- Add notes explaining why deals moved (or didn't move)

---

## 4. Activity Management and Follow-ups

### Scenario
Creating a structured follow-up sequence for a deal.

### Prompt

```
Use the follow-up-sequence prompt for deal #12345 over 14 days.
```

Or manually:

```
For deal #12345, create a follow-up sequence:
- Tomorrow: Send proposal email
- In 3 days: Follow-up call
- In 7 days: Check-in email
- In 14 days: Final follow-up call
```

### What Happens

1. **Get deal details**
   ```
   deals/get: { id: 12345 }
   ```

2. **Create email activity**
   ```
   activities/create: {
     subject: "Send proposal email",
     type: "email",
     due_date: "2025-12-11",
     deal_id: 12345,
     person_id: <person_id>
   }
   ```

3. **Create follow-up call**
   ```
   activities/create: {
     subject: "Follow-up call",
     type: "call",
     due_date: "2025-12-13",
     due_time: "10:00",
     deal_id: 12345,
     person_id: <person_id>
   }
   ```

4. **Create check-in**
   ```
   activities/create: {
     subject: "Check-in email",
     type: "email",
     due_date: "2025-12-17",
     deal_id: 12345,
     person_id: <person_id>
   }
   ```

5. **Create final follow-up**
   ```
   activities/create: {
     subject: "Final follow-up call",
     type: "call",
     due_date: "2025-12-24",
     due_time: "14:00",
     deal_id: 12345,
     person_id: <person_id>
   }
   ```

### Activity Best Practices

- Space activities appropriately (don't overwhelm prospects)
- Mix activity types (email, call, meeting)
- Set specific times for calls/meetings
- Link activities to both deals and persons
- Mark activities as done when completed

---

## 5. Contact Organization

### Scenario
Organizing contacts by company and adding relevant metadata.

### Prompt

```
Find all contacts at Microsoft and organize them. Add any without an
organization link, and create notes about their roles.
```

### What Happens

1. **Search for organization**
   ```
   organizations/search: { term: "Microsoft" }
   ```

2. **Get existing persons at organization**
   ```
   organizations/persons: { id: <org_id> }
   ```

3. **Search for unlinked contacts**
   ```
   persons/search: { term: "microsoft.com" }
   ```

4. **Link persons to organization**
   ```
   persons/update: {
     id: <person_id>,
     org_id: <org_id>
   }
   ```

5. **Add role notes**
   ```
   notes/create: {
     content: "Role: Senior Developer",
     person_id: <person_id>
   }
   ```

### Organization Tips

- Maintain consistent organization naming
- Link all contacts to their organizations
- Use custom fields for roles/departments
- Add notes for relationship context

---

## 6. File and Document Management

### Scenario
Uploading proposals and contracts to deals.

### Prompt

```
Upload the proposal document to deal #12345 and add a note
that it was sent to the client on today's date.
```

### What Happens

1. **Upload file**
   ```
   files/upload: {
     file_path: "/path/to/proposal.pdf",
     deal_id: 12345
   }
   ```

2. **Add documentation note**
   ```
   notes/create: {
     content: "Proposal sent to client on 2025-12-10",
     deal_id: 12345
   }
   ```

3. **Create follow-up activity**
   ```
   activities/create: {
     subject: "Follow up on proposal",
     type: "call",
     due_date: "2025-12-13",
     deal_id: 12345
   }
   ```

### File Management Tips

- Upload files directly to entities (deals/persons/orgs)
- Add notes when files are uploaded or sent
- Use descriptive file names
- Track document versions in notes

---

## 7. Reporting and Analytics

### Scenario
Generating weekly pipeline reports and deal summaries.

### Prompt

```
Run the weekly-pipeline-review prompt.
```

Or manually:

```
Give me a complete pipeline analysis:
- Deals by stage with total values
- Deals won and lost this week
- Deals with approaching close dates (next 7 days)
- Stale deals with no activity in 7+ days
```

### What Happens

1. **Get all open deals**
   ```
   deals/list: { status: "open" }
   ```

2. **Get deal summaries**
   ```
   deals/summary: { status: "open" }
   ```

3. **Get won deals**
   ```
   deals/list: {
     status: "won",
     // Filter by date range
   }
   ```

4. **Get lost deals**
   ```
   deals/list: {
     status: "lost",
     // Filter by date range
   }
   ```

5. **Analyze activities**
   ```
   activities/list: {
     done: false,
     // Check for overdue
   }
   ```

### Sample Report Output

```markdown
# Weekly Pipeline Review - Week of Dec 10, 2025

## Pipeline Overview
- **Total Open Deals**: 47
- **Total Value**: $2,350,000
- **Average Deal Size**: $50,000

## Deals by Stage
1. Qualified (15 deals): $750,000
2. Proposal (12 deals): $600,000
3. Negotiation (10 deals): $500,000
4. Closing (10 deals): $500,000

## This Week's Activity
- **Won**: 3 deals ($125,000)
- **Lost**: 1 deal ($25,000)
- **Win Rate**: 75%

## Upcoming Close Dates (Next 7 Days)
- Deal #123: Acme Corp ($50,000) - Dec 15
- Deal #124: TechCo ($75,000) - Dec 16
- Deal #125: StartupXYZ ($25,000) - Dec 17

## ⚠️ Stale Deals (No Activity in 7+ Days)
- Deal #126: Old Corp ($100,000) - Last activity: Nov 30
- Deal #127: Forgotten Inc ($50,000) - Last activity: Dec 1

## Recommendations
1. Follow up on stale deals immediately
2. Prioritize deals closing this week
3. Focus on moving Qualified stage deals to Proposal
```

---

## 8. Lost Deal Analysis

### Scenario
Understanding why deals are being lost to improve sales process.

### Prompt

```
Run the lost-deal-analysis prompt from 2025-10-01 to 2025-12-10.
```

Or manually:

```
Analyze all deals we lost between October 1 and December 10.
Group by lost reason, show total value lost, and identify patterns.
```

### What Happens

1. **Get lost deals**
   ```
   deals/list: {
     status: "lost",
     // Filter by date range
   }
   ```

2. **Analyze by reason**
   - Group deals by `lost_reason`
   - Calculate total value per reason
   - Count deals per reason

3. **Get additional context**
   ```
   For each lost deal:
   - Get activities (to see engagement level)
   - Get notes (to understand context)
   - Check timeline (how long in pipeline)
   ```

### Sample Analysis Output

```markdown
# Lost Deal Analysis
**Period**: Oct 1 - Dec 10, 2025

## Summary
- **Total Lost Deals**: 12
- **Total Value Lost**: $625,000
- **Average Deal Size**: $52,083

## Lost Reasons Breakdown

### 1. Price Too High (5 deals, $275,000)
- 41.7% of lost deals
- 44% of lost value
- **Action**: Review pricing strategy, offer more flexible options

### 2. Chose Competitor (4 deals, $200,000)
- 33.3% of lost deals
- 32% of lost value
- **Action**: Competitive analysis needed, strengthen differentiation

### 3. No Budget (2 deals, $100,000)
- 16.7% of lost deals
- 16% of lost value
- **Action**: Qualify budget earlier in sales process

### 4. Lost Contact (1 deal, $50,000)
- 8.3% of lost deals
- 8% of lost value
- **Action**: Improve follow-up cadence

## Patterns Identified
- Deals >$75K more likely to be lost to competitors
- Deals with <3 touchpoints often lost contact
- Price objections increased 25% vs last quarter

## Recommendations
1. Implement earlier budget qualification (BANT)
2. Increase touchpoint frequency for high-value deals
3. Develop competitive battle cards
4. Consider tiered pricing strategy
```

---

## 9. Team Collaboration

### Scenario
Managing deal ownership and team collaboration.

### Prompt

```
I'm going on vacation next week. Transfer all my open deals to Sarah
(user_id: 456) and add her as a follower to deals I'm closing this month.
```

### What Happens

1. **Get current user info**
   ```
   Access resource: pipedrive://current-user
   ```

2. **Get user's open deals**
   ```
   deals/list: {
     user_id: <current_user_id>,
     status: "open"
   }
   ```

3. **Transfer ownership**
   ```
   For each deal:
   deals/update: {
     id: <deal_id>,
     user_id: 456
   }
   ```

4. **Add as follower**
   ```
   For deals closing this month:
   deals/add-follower: {
     id: <deal_id>,
     user_id: 456
   }
   ```

5. **Create handoff notes**
   ```
   notes/create: {
     content: "Deal transferred to Sarah. Context: ...",
     deal_id: <deal_id>
   }
   ```

### Collaboration Tips

- Add detailed handoff notes
- Use followers for visibility
- Transfer related activities too
- Set up automatic notifications

---

## 10. Bulk Operations

### Scenario
Updating multiple deals at once (e.g., quarterly planning).

### Prompt

```
For all deals in the Negotiation stage with expected close dates in Q1 2025,
extend the close dates by 30 days and add a note explaining the delay
is due to client budget freezes.
```

### What Happens

1. **List target deals**
   ```
   deals/list: {
     stage_id: <negotiation_stage_id>,
     // Filter by expected_close_date
   }
   ```

2. **Update each deal**
   ```
   For each deal:
   deals/update: {
     id: <deal_id>,
     expected_close_date: <new_date>
   }
   ```

3. **Add context notes**
   ```
   For each deal:
   notes/create: {
     content: "Close date extended 30 days due to client budget freeze in Q1.",
     deal_id: <deal_id>
   }
   ```

### Bulk Operation Best Practices

- Always add notes explaining bulk changes
- Preview changes before executing
- Update in batches to respect rate limits
- Verify results after completion

---

## 11. Pipeline Health Check

### Scenario
Regular pipeline hygiene and data quality checks.

### Prompt

```
Run a pipeline health check:
- Find deals without expected close dates
- Find deals without associated contacts
- Find deals with no activities
- Find deals stuck in the same stage for >30 days
```

### What Happens

1. **Check for missing data**
   ```
   deals/list: { status: "open" }
   // Filter results for missing fields
   ```

2. **Analyze each category**
   - Deals without `expected_close_date`
   - Deals without `person_id` or `org_id`
   - Deals with no activities
   - Deals with long stage duration

3. **Generate action items**

### Sample Health Check Output

```markdown
# Pipeline Health Check - Dec 10, 2025

## Issues Found

### ⚠️ Missing Close Dates (8 deals)
- Deal #101: Small Corp Deal
- Deal #102: Another Deal
**Action**: Set realistic close dates

### ⚠️ No Associated Contact (3 deals)
- Deal #201: Orphan Deal ($50k)
**Action**: Link to person/organization

### ⚠️ No Activities (12 deals)
- Deal #301: Stale Deal ($25k)
**Action**: Schedule follow-up activities

### ⚠️ Stuck in Stage >30 Days (5 deals)
- Deal #401: Proposal stage since Nov 1
**Action**: Move forward or mark as lost

## Summary
- **Total Issues**: 28
- **Critical Issues**: 3 (no contact)
- **Estimated Impact**: $375,000 at risk

## Recommendations
1. Update all missing close dates this week
2. Link orphan deals to contacts
3. Create activity plans for inactive deals
4. Review stuck deals for stage movement
```

---

## 12. Customer Onboarding

### Scenario
Moving a won deal through the onboarding process.

### Prompt

```
Deal #12345 was just won. Create an onboarding workflow:
1. Mark the deal as won
2. Create onboarding tasks for the next 30 days
3. Add the customer to our "Active Customers" organization field
4. Schedule kickoff meeting
```

### What Happens

1. **Update deal status**
   ```
   deals/update: {
     id: 12345,
     status: "won"
   }
   ```

2. **Create onboarding activities**
   ```
   activities/create: {
     subject: "Send welcome email and onboarding guide",
     type: "email",
     due_date: "2025-12-11",
     deal_id: 12345
   }

   activities/create: {
     subject: "Kickoff meeting",
     type: "meeting",
     due_date: "2025-12-13",
     due_time: "10:00",
     deal_id: 12345,
     duration: "01:00"
   }

   activities/create: {
     subject: "Week 1 check-in",
     type: "call",
     due_date: "2025-12-17",
     deal_id: 12345
   }

   activities/create: {
     subject: "30-day review",
     type: "meeting",
     due_date: "2026-01-09",
     deal_id: 12345
   }
   ```

3. **Update organization**
   ```
   organizations/update: {
     id: <org_id>,
     // Add to Active Customers group
   }
   ```

4. **Add completion note**
   ```
   notes/create: {
     content: "Deal won! Onboarding workflow initiated on 2025-12-10.",
     deal_id: 12345
   }
   ```

---

## Tips for All Workflows

### 1. Use MCP Resources First

Access reference data without API calls:
- `pipedrive://pipelines` - Pipeline structure
- `pipedrive://custom-fields` - Available fields
- `pipedrive://current-user` - Your user info

### 2. Search Before Creating

Always search for existing records to avoid duplicates:
```
First: persons/search, organizations/search
Then: Create only if not found
```

### 3. Link Related Entities

Build relationships:
- Link persons to organizations
- Link deals to persons and organizations
- Link activities to deals and persons
- Link files to relevant entities

### 4. Add Context with Notes

Use notes liberally:
- Why decisions were made
- Important conversation points
- Status updates
- Handoff information

### 5. Set Realistic Dates

- Expected close dates should be realistic
- Activity due dates should be actionable
- Review and adjust dates as situations change

### 6. Use Guided Prompts

Leverage built-in prompts for common workflows:
- `create-deal-workflow`
- `sales-qualification`
- `follow-up-sequence`
- `weekly-pipeline-review`
- `lost-deal-analysis`

### 7. Monitor and Iterate

- Review your workflows regularly
- Track what works and what doesn't
- Adjust based on your sales process
- Use metrics to measure effectiveness

---

## Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review [CUSTOM_FIELDS.md](./CUSTOM_FIELDS.md) for field usage
- See [README.md](../README.md) for tool documentation

For more complex workflows or custom automation, consider combining multiple simple workflows or reaching out for support.
