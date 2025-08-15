# API Service Module

This directory contains the modular API service structure for the frontend application. The API services are organized by functionality to improve maintainability and code organization.

## Structure

```
apiService/
├── index.ts          # Main API instance with interceptors
├── api.ts           # Main export file that combines all services
├── authService.ts   # Authentication related API calls
├── userService.ts   # User management API calls
├── tenantService.ts # Tenant management API calls
├── apiKeyService.ts # API key management API calls
├── webhookService.ts # Webhook management API calls
├── dashboardService.ts # Dashboard and analytics API calls
├── kycService.ts    # KYC verification API calls
└── README.md        # This documentation file
```

## Services

### 1. Auth Service (`authService.ts`)
Handles all authentication-related API calls:
- User sign up
- User sign in
- Get user profile
- Update user profile
- Delete user account

### 2. User Service (`userService.ts`)
Manages user-related operations:
- Get all users
- Get user by ID
- Create user
- Update user
- Delete user
- Deactivate user
- Get user stats
- Team management operations

### 3. Tenant Service (`tenantService.ts`)
Handles tenant-related operations:
- Create tenant
- Get tenant
- Update tenant
- Delete tenant
- List tenants (admin only)

### 4. API Key Service (`apiKeyService.ts`)
Manages API key operations:
- Create API key
- Get API keys
- Update API key
- Delete API key

### 5. Webhook Service (`webhookService.ts`)
Handles webhook management:
- Create webhook
- Get webhooks
- Get webhook by ID
- Update webhook
- Delete webhook
- Get webhook deliveries
- Retry failed delivery
- Test webhook

### 6. Dashboard Service (`dashboardService.ts`)
Provides dashboard-related data:
- Get user stats
- Get recent activity

### 7. KYC Service (`kycService.ts`)
Handles KYC verification operations:
- Get verifications
- Get verification by ID
- Update verification status
- Upload documents

## Usage

### Importing Services

```typescript
// Import specific services
import { authAPI, usersAPI, webhooksAPI } from '@/lib/apiService/api'

// Or import from the main api file (backward compatibility)
import { authAPI, usersAPI, webhooksAPI } from '@/lib/api'
```

### Using Services

```typescript
// Authentication
const user = await authAPI.signIn(email, password)

// User management
const users = await usersAPI.getUsers()

// Webhook management
const webhooks = await webhooksAPI.getWebhooks()

// Create a new webhook
const newWebhook = await webhooksAPI.createWebhook({
  name: 'My Webhook',
  url: 'https://example.com/webhook',
  events: ['user.created', 'verification.session.completed']
})
```

## API Instance

The main API instance (`index.ts`) includes:
- Axios configuration with base URL
- Request interceptors for authentication
- Response interceptors for error handling
- Automatic token management

## Error Handling

All services use the centralized error handling from the API instance:
- 401 errors automatically redirect to login
- Console logging for debugging
- Consistent error response format

## Adding New Services

To add a new service:

1. Create a new service file (e.g., `newService.ts`)
2. Import the API instance: `import api from './index'`
3. Export your service functions
4. Add the export to `api.ts`
5. Update this README

Example:
```typescript
// newService.ts
import api from './index'

export const newServiceAPI = {
  getData: async () => {
    const response = await api.get('/new-endpoint')
    return response.data
  }
}
```

## Benefits of Modular Structure

1. **Maintainability**: Each service is focused on a specific domain
2. **Reusability**: Services can be imported individually
3. **Testing**: Easier to mock and test individual services
4. **Code Organization**: Clear separation of concerns
5. **Scalability**: Easy to add new services without affecting existing ones

## Migration from Old Structure

The old monolithic `api.ts` file has been refactored into modular services. The main `api.ts` file now re-exports all services for backward compatibility, so existing code should continue to work without changes.

## Webhook Integration

The webhook service provides comprehensive webhook management capabilities:

- **Event Types**: Support for all webhook events (user, tenant, API key, verification events)
- **Delivery Tracking**: Monitor webhook delivery status and history
- **Retry Logic**: Automatic retry with exponential backoff for failed deliveries
- **Testing**: Test webhook endpoints before going live
- **Security**: HMAC-SHA256 signature verification support

### Webhook Events Supported

- User events: `user.created`, `user.updated`, `user.deleted`, `user.deactivated`
- Tenant events: `tenant.created`, `tenant.updated`, `tenant.deleted`, `tenant.status.changed`
- API key events: `apikey.created`, `apikey.updated`, `apikey.deleted`, `apikey.used`
- Verification events: `verification.session.created`, `verification.session.started`, `verification.session.completed`, `verification.session.failed`, `verification.session.expired`, `verification.completed`

### Webhook Management Features

- Create and configure webhook endpoints
- Monitor delivery status in real-time
- Retry failed deliveries manually
- Test webhook endpoints
- View delivery history and logs
- Configure retry policies and timeouts
- Set custom headers and secrets 