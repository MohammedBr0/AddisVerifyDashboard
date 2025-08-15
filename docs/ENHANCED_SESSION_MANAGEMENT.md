# Enhanced Admin Session Management

This document describes the enhanced session management system for the admin dashboard that improves performance and user experience by reducing unnecessary API calls.

## Overview

The enhanced session management system provides:

- **Cached Session Validation**: Reduces API calls by caching session validation results
- **Automatic Session Refresh**: Periodically refreshes sessions before they expire
- **Visual Session Status**: Shows current session status and remaining time
- **Efficient Initialization**: Only validates sessions when necessary

## Key Components

### 1. Enhanced Auth Store (`src/lib/store.ts`)

The auth store now includes admin session management:

```typescript
interface AuthState {
  // ... existing fields
  adminSession: {
    isSuperAdmin: boolean
    lastVerified: number | null
    sessionValid: boolean
  }
}
```

**New Actions:**
- `setAdminSession()` - Set admin session data
- `clearAdminSession()` - Clear admin session
- `updateAdminSessionValidity()` - Update session validity

### 2. Enhanced Admin Auth Hook (`src/hooks/useAdminAuth.ts`)

The `useAdminAuth` hook now:

- Uses cached session data when available
- Only makes API calls when session is invalid or expired
- Provides session refresh functionality
- Implements 30-minute session validity

**Key Features:**
- Session caching with 30-minute validity
- Automatic session validation on page load
- Manual session refresh capability
- Efficient re-rendering

### 3. Session Refresh Hook (`src/hooks/useSessionRefresh.ts`)

Automatically refreshes sessions:

- Refreshes every 20 minutes (session valid for 30 minutes)
- Prevents session expiration during active use
- Handles refresh failures gracefully

### 4. Session Status Component (`src/components/admin/SessionStatus.tsx`)

Visual indicator showing:

- Current session status (Valid, Expiring, Expired, Invalid)
- Time remaining until expiration
- Manual refresh button
- Color-coded status badges

### 5. Session Utilities (`src/lib/sessionUtils.ts`)

Utility functions for session management:

- `initializeAdminSession()` - Initialize session on app startup
- `isSessionValid()` - Check if session is valid
- `getSessionTimeRemaining()` - Get time until expiration
- `formatSessionTimeRemaining()` - Format time for display

### 6. Session Initializer (`src/components/admin/SessionInitializer.tsx`)

Component that initializes sessions on app startup:

- Runs once when admin layout loads
- Validates existing sessions
- Shows loading state during initialization

## Session Lifecycle

### 1. Initialization
```typescript
// On app startup
const isSessionValid = await initializeAdminSession()
```

### 2. Validation
```typescript
// Check if cached session is still valid
if (adminSession.isSuperAdmin && isSessionValid(adminSession)) {
  // Use cached session
} else {
  // Verify with backend
  const isVerified = await verifyAdminAccess()
}
```

### 3. Refresh
```typescript
// Automatic refresh every 20 minutes
setInterval(async () => {
  await refreshSession()
}, 20 * 60 * 1000)
```

### 4. Expiration
```typescript
// Session expires after 30 minutes
const SESSION_VALIDITY_DURATION = 30 * 60 * 1000
```

## Performance Benefits

### Before Enhancement
- API call on every page render
- No session caching
- Frequent backend validation
- Poor user experience during loading

### After Enhancement
- Cached session validation
- API calls only when necessary
- Automatic session refresh
- Smooth user experience

## Usage Examples

### Basic Usage
```typescript
import { useAdminAuth } from '@/hooks/useAdminAuth'

function AdminComponent() {
  const { isAuthenticated, isSuperAdmin, isLoading, refreshSession } = useAdminAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated || !isSuperAdmin) return <div>Access Denied</div>
  
  return <div>Admin Content</div>
}
```

### Manual Session Refresh
```typescript
const { refreshSession } = useAdminAuth()

const handleRefresh = async () => {
  const success = await refreshSession()
  if (!success) {
    // Handle refresh failure
  }
}
```

### Session Status Display
```typescript
import { SessionStatus } from '@/components/admin/SessionStatus'

function AdminLayout() {
  return (
    <div>
      <SessionStatus />
      {/* Other layout content */}
    </div>
  )
}
```

## Configuration

### Session Duration
```typescript
// In sessionUtils.ts
export const SESSION_VALIDITY_DURATION = 30 * 60 * 1000 // 30 minutes
```

### Refresh Interval
```typescript
// In useSessionRefresh.ts
const REFRESH_INTERVAL = 20 * 60 * 1000 // 20 minutes
```

## Error Handling

The system handles various error scenarios:

1. **Network Errors**: Graceful fallback to cached session
2. **Token Expiration**: Automatic logout and redirect
3. **Invalid Sessions**: Clear session and require re-authentication
4. **Refresh Failures**: Retry mechanism with exponential backoff

## Security Considerations

1. **Session Validation**: All sessions are validated with the backend
2. **Token Security**: Tokens are stored securely in localStorage
3. **Automatic Logout**: Sessions expire automatically after 30 minutes
4. **Role Verification**: Super admin role is verified on each validation

## Migration Guide

### For Existing Components

1. **No Changes Required**: Existing components using `useAdminAuth` will work automatically
2. **Optional Enhancements**: Add `SessionStatus` component for better UX
3. **Performance**: Components will automatically benefit from cached sessions

### For New Components

1. Use `useAdminAuth` hook for authentication
2. Add `SessionStatus` component for session visibility
3. Implement `refreshSession` for manual refresh if needed

## Troubleshooting

### Common Issues

1. **Session Not Refreshing**: Check network connectivity and backend availability
2. **Invalid Session State**: Clear localStorage and re-authenticate
3. **Performance Issues**: Ensure session caching is working properly

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug_session', 'true')
```

## Future Enhancements

1. **Offline Support**: Cache more data for offline functionality
2. **Multi-tab Sync**: Synchronize sessions across browser tabs
3. **Advanced Analytics**: Track session usage patterns
4. **Customizable Duration**: Allow configurable session durations
