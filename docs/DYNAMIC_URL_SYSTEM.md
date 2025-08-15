# Dynamic URL System

This document explains how the dynamic URL system works for admin login redirection.

## Overview

The system automatically constructs admin login URLs based on the current environment and base URL, eliminating the need for hardcoded URLs.

## URL Construction Logic

### Base URL Detection

The system detects the base URL in the following order:

1. **Client-side**: Uses `window.location` to get the current URL
2. **Server-side**: Uses `NEXT_PUBLIC_BASE_URL` environment variable
3. **Fallback**: Defaults to `http://localhost:3000`

### Admin URL Construction

Based on the detected base URL:

#### Development Environment
- **Input**: `http://localhost:3000`
- **Output**: `http://admin.localhost:8000`

#### Production Environment
- **Input**: `https://myapp.com`
- **Output**: `https://admin.myapp.com`

## Configuration

### Environment Variables

Add to your `.env.local` file:

```bash
# Base URL for the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### URL Utility Functions

```typescript
import { 
  getBaseUrl, 
  getAdminBaseUrl, 
  getAdminLoginUrl, 
  getLoginUrl 
} from '@/lib/utils/urlUtils'

// Get current base URL
const baseUrl = getBaseUrl() // http://localhost:3000

// Get admin base URL
const adminBaseUrl = getAdminBaseUrl() // http://admin.localhost:8000

// Get admin login URL
const adminLoginUrl = getAdminLoginUrl() // http://admin.localhost:8000/admin/login

// Get regular login URL
const loginUrl = getLoginUrl() // http://localhost:3000/auth/login
```

## Usage Examples

### Admin Route Guard

```typescript
import { getAdminLoginUrl } from '@/lib/utils/urlUtils'

// Automatically redirects to correct admin login URL
router.push(getAdminLoginUrl())
```

### Admin Layout Logout

```typescript
import { getAdminLoginUrl } from '@/lib/utils/urlUtils'

const handleLogout = () => {
  logout()
  const adminLoginUrl = getAdminLoginUrl()
  router.push(adminLoginUrl)
}
```

## Benefits

1. **Environment Agnostic**: Works in development, staging, and production
2. **No Hardcoded URLs**: Eliminates manual URL updates
3. **Consistent Behavior**: Same logic across all components
4. **Easy Configuration**: Single environment variable controls all URLs
5. **Automatic Detection**: Falls back to intelligent defaults

## Migration from Hardcoded URLs

### Before
```typescript
router.push('http://admin.localhost:8000/admin/login')
```

### After
```typescript
import { getAdminLoginUrl } from '@/lib/utils/urlUtils'
router.push(getAdminLoginUrl())
```

## Testing

The URL utility functions work in both client and server environments:

- **Client-side**: Uses `window.location` for dynamic detection
- **Server-side**: Uses environment variables for static generation
- **Fallback**: Provides sensible defaults for all scenarios
