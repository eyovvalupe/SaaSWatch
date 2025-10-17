# Tenant Management Guide

## Overview

Appfuze.ai is a **multi-tenant SaaS platform** where each organization has complete data isolation. This guide explains how to manage tenants (organizations) in both development and production environments.

---

## Architecture

### Multi-Tenant Design

- **Organization-based isolation**: Every data entity belongs to an organization
- **Automatic tenant assignment**: New users automatically get their own organization on first login
- **Complete data segregation**: All database queries filter by `organizationId`
- **PostgreSQL with Drizzle ORM**: Production-ready database layer

### Database Schema

All core tables include an `organizationId` field:
- `applications`
- `licenses`
- `renewals`
- `recommendations`
- `spending_history`
- `conversations`
- `messages`

---

## Development Environment

### 1. Creating Demo Data for Testing

When you first log in, your organization is empty. You have two options:

#### Option A: Use the Dashboard UI (Recommended)
1. Log in to the application
2. Click the **"Load Demo Data"** button on the welcome screen
3. Demo data will be automatically created for your organization

#### Option B: Use the API Directly
```bash
# After logging in, call the seed endpoint
curl -X POST https://your-repl.replit.dev/api/seed-demo \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### 2. What Demo Data Includes

- **6 Sample Applications**: Slack, Salesforce, Zoom, GitHub, Figma, Notion
- **License Tracking**: Active users vs. total licenses
- **Renewal Schedules**: Contract renewal dates and costs
- **Cost Recommendations**: AI-driven optimization suggestions
- **Spending Trends**: Historical spending data for charts
- **Team Chat**: Sample internal collaboration threads
- **Vendor CRM**: Sample vendor negotiation conversations

### 3. Testing Multi-Tenancy Locally

To test tenant isolation:

1. **Login with User A** → Gets Organization A with unique data
2. **Logout** → Clear session
3. **Login with User B** → Gets Organization B (cannot see User A's data)

Verify isolation by checking:
- Applications list (should be different for each user)
- Conversations (no cross-tenant access)
- Recommendations (scoped to organization)

---

## Production Environment

### 1. User Onboarding Flow

When a new user signs up in production:

1. **Authentication**: User logs in via Replit Auth (Google, GitHub, Apple, Email)
2. **Organization Creation**: System automatically creates a new organization:
   ```typescript
   {
     name: "${firstName}'s Organization",
     plan: "starter"  // Default plan
   }
   ```
3. **User Assignment**: User is linked to their new organization
4. **Empty Workspace**: User sees empty dashboard with option to:
   - Load demo data (for testing/onboarding)
   - Manually add their first application

### 2. Managing Organizations (Admin Operations)

#### View All Organizations
```sql
-- Connect to production database via Replit Database pane
SELECT id, name, plan, created_at 
FROM organizations 
ORDER BY created_at DESC;
```

#### Find Users in an Organization
```sql
SELECT u.id, u.email, u.first_name, u.last_name, o.name as org_name
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE o.id = 'organization-uuid-here';
```

#### Check Organization's Application Count
```sql
SELECT 
  o.name as organization,
  o.plan,
  COUNT(a.id) as app_count,
  SUM(CAST(a.monthly_cost as DECIMAL)) as total_monthly_cost
FROM organizations o
LEFT JOIN applications a ON a.organization_id = o.id
GROUP BY o.id, o.name, o.plan
ORDER BY total_monthly_cost DESC;
```

### 3. Organization Plans

The platform supports different subscription tiers:

- **Starter** (Default): Basic features, limited applications
- **Professional**: Full feature set, unlimited applications
- **Enterprise**: Custom features, dedicated support, ROI add-on

#### Upgrade an Organization
```sql
-- Upgrade organization to Professional plan
UPDATE organizations 
SET plan = 'professional' 
WHERE id = 'organization-uuid-here';

-- Upgrade to Enterprise (includes ROI add-on)
UPDATE organizations 
SET plan = 'enterprise' 
WHERE id = 'organization-uuid-here';
```

### 4. Data Migration & Cleanup

#### Move User to Different Organization
```sql
-- Transfer user to another organization
UPDATE users 
SET organization_id = 'target-org-uuid' 
WHERE id = 'user-uuid-here';
```

#### Delete Organization (Cascade Deletes All Data)
```sql
-- WARNING: This deletes ALL data for the organization
-- Including applications, licenses, renewals, conversations, etc.
DELETE FROM organizations WHERE id = 'org-uuid-here';
```

#### Archive Organization (Soft Delete)
```sql
-- Add an 'archived' column to organizations table first
ALTER TABLE organizations ADD COLUMN archived BOOLEAN DEFAULT false;

-- Then archive instead of deleting
UPDATE organizations 
SET archived = true 
WHERE id = 'org-uuid-here';
```

---

## Security & Access Control

### 1. API-Level Tenant Isolation

All API endpoints enforce tenant isolation:

```typescript
// Example: Get applications for current user's organization only
app.get("/api/applications", isAuthenticated, async (req, res) => {
  const userId = (req.user as any).claims.sub;
  const user = await storage.getUser(userId);
  
  // CRITICAL: Always filter by organizationId
  const applications = await storage.getApplications(user.organizationId);
  res.json(applications);
});
```

### 2. Database-Level Isolation

All storage methods enforce organization scoping:

```typescript
// Always pass organizationId to prevent cross-tenant access
async getApplications(organizationId: string): Promise<Application[]> {
  return db.select()
    .from(applications)
    .where(eq(applications.organizationId, organizationId));
}
```

### 3. Session Management

- **PostgreSQL Session Store**: Sessions persisted in database
- **7-Day Session TTL**: Automatic expiration after 1 week
- **Secure Cookies**: HttpOnly, Secure flags enabled
- **Token Refresh**: Automatic token renewal for active sessions

---

## Monitoring & Analytics

### 1. Track Active Organizations
```sql
SELECT 
  COUNT(DISTINCT organization_id) as total_orgs,
  COUNT(DISTINCT CASE WHEN plan = 'enterprise' THEN organization_id END) as enterprise_orgs,
  COUNT(DISTINCT CASE WHEN plan = 'professional' THEN organization_id END) as professional_orgs,
  COUNT(DISTINCT CASE WHEN plan = 'starter' THEN organization_id END) as starter_orgs
FROM organizations
WHERE archived = false;  -- If using soft delete
```

### 2. Monitor Active Users
```sql
SELECT 
  DATE(s.expire) as session_date,
  COUNT(DISTINCT s.sess::json->>'passport'->>'user'->>'claims'->>'sub') as active_users
FROM sessions s
WHERE s.expire > NOW()
GROUP BY session_date
ORDER BY session_date DESC;
```

### 3. Identify Power Users (Most Applications)
```sql
SELECT 
  o.name as organization,
  o.plan,
  COUNT(a.id) as app_count
FROM organizations o
JOIN applications a ON a.organization_id = o.id
GROUP BY o.id, o.name, o.plan
HAVING COUNT(a.id) > 10
ORDER BY app_count DESC;
```

---

## Best Practices

### 1. **Always Validate Organization Access**
- Every API call must verify the user belongs to the organization
- Never expose `organizationId` in client-side URLs
- Use session data to determine user's organization

### 2. **Test Tenant Isolation Thoroughly**
- Create multiple test accounts
- Verify no data leakage between organizations
- Test edge cases (deleted organizations, transferred users)

### 3. **Handle Organization Creation Carefully**
- Auto-create organization for new users
- Set appropriate default plan
- Consider onboarding flow (demo data vs. manual setup)

### 4. **Plan for Scale**
- Index `organizationId` on all multi-tenant tables
- Monitor query performance as organizations grow
- Consider sharding strategy for very large deployments

### 5. **Audit & Compliance**
- Log all cross-organization operations
- Track organization plan changes
- Monitor data access patterns

---

## Troubleshooting

### Issue: User Sees Empty Dashboard
**Solution**: User's organization has no data. They should:
1. Click "Load Demo Data" button, OR
2. Manually add first application

### Issue: User Can't Access Data
**Check**:
- Is user authenticated? (Check session in database)
- Is `organizationId` set on user record?
- Does organization exist and is not archived?

### Issue: Data Appearing Across Tenants
**This is a critical security bug. Immediately**:
1. Check API endpoint filters for `organizationId`
2. Verify storage layer queries include organization filter
3. Review recent code changes for tenant isolation breaks

---

## Support & Maintenance

For production issues:
1. **Database Access**: Use Replit Database pane (read-only recommended)
2. **Logs**: Check server logs via Replit workspace
3. **Sessions**: Query `sessions` table for auth debugging
4. **Organizations**: Query `organizations` and `users` tables for tenant info

For urgent security issues (cross-tenant data leakage):
1. Immediately disable affected API endpoints
2. Audit database access logs
3. Notify affected organizations
4. Deploy hotfix with proper tenant isolation
