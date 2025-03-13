# Documentary Credit AI User Database

This document outlines the user database structure for the Documentary Credit AI application.

## Database Schema

The database schema is defined in `schema.sql` and includes the following tables:

1. **users** - Extends Supabase auth.users with application-specific user data
2. **document_uploads** - Tracks document uploads by users
3. **document_results** - Stores processing results for uploaded documents
4. **subscription_history** - Tracks changes to user subscriptions
5. **user_activity_logs** - Logs user activities for auditing and analytics

## Setting Up in Supabase

To set up this database in your Supabase project:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `schema.sql`
5. Run the query to create all tables and set up Row Level Security (RLS)

## Integration with Next.js Application

The database is integrated with the application through:

- `src/types/database.ts` - TypeScript interfaces for database tables
- `src/utils/database/userDatabase.ts` - Server-side utility functions
- `src/hooks/useUserDatabase.ts` - Client-side React hook

## Usage Examples

### Server-side (in API routes or Server Components)

```typescript
import { UserDatabase } from '@/utils/database/userDatabase';

// Get user by ID
const user = await UserDatabase.getUserById('user-uuid');

// Update user profile
const updatedUser = await UserDatabase.updateUser('user-uuid', { 
  full_name: 'John Doe',
  company_name: 'ACME Corp'
});

// Create document upload
const upload = await UserDatabase.createDocumentUpload({
  user_id: 'user-uuid',
  file_name: 'document.pdf',
  file_path: 'uploads/document.pdf',
  file_size: 1024,
  file_type: 'application/pdf',
  status: 'pending'
});
```

### Client-side (in React components)

```typescript
import { useUserDatabase } from '@/hooks/useUserDatabase';

function ProfileComponent() {
  const { 
    user, 
    loading, 
    error, 
    updateUserProfile,
    getUserDocuments 
  } = useUserDatabase();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome, {user.full_name || user.email}</h1>
      <p>Subscription: {user.subscription_tier}</p>
      <p>Document Credits: {user.document_credits}</p>
    </div>
  );
}
```

## Row Level Security (RLS)

The database uses Supabase Row Level Security to ensure users can only access their own data. Each table has appropriate RLS policies defined in the schema.
