# Multi-Tenant System Setup Guide

This guide explains how to set up and use the multi-tenant system with subdomain routing for AddisVerify.

## Overview

The system now supports three different access points:

1. **Main Domain** (`localhost:8000`) - Public access, login/register pages
2. **Admin Subdomain** (`admin.localhost:8000`) - Super admin dashboard
3. **Dashboard Subdomain** (`dashboard.localhost:8000`) - Tenant dashboard

## Backend Setup

### 1. Environment Configuration

Create a `.env` file in the `ad-dis-kyc` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/addisverify"

# Server Configuration
PORT=3000
NODE_ENV=development

# Stack Auth (if using)
STACK_PROJECT_ID=your_stack_project_id
STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

### 2. Database Setup

```bash
cd ad-dis-kyc
npm install
npx prisma generate
npx prisma db push
```

### 3. Create Super Admin User

You'll need to create a super admin user in the database. You can do this through the Prisma Studio or by running a seed script:

```bash
npx prisma studio
```

In Prisma Studio, create a user with:
- `role`: `SUPER_ADMIN`
- `isActive`: `true`

## Frontend Setup

### 1. Environment Configuration

Create a `.env.local` file in the `addisverify` directory:

```env
# Backend API URL
BACKEND_URL=http://localhost:3000

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001

# Stack Auth Configuration (if using)
STACK_PROJECT_ID=your_stack_project_id
STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key
```

### 2. Install Dependencies

```bash
cd addisverify
npm install
```

## Running the System

### 1. Start Backend

```bash
cd ad-dis-kyc
npm run dev
```

The backend will be available at `http://localhost:3000`

### 2. Start Frontend

```bash
cd addisverify
npm run dev
```

The frontend will be available at `http://localhost:3001`

## Access Points

### Main Domain (Public)
- **URL**: `http://localhost:3001`
- **Purpose**: Public landing page, login, and registration
- **Features**: 
  - Public landing page
  - User login/registration
  - KYC verification demo

### Admin Subdomain
- **URL**: `http://admin.localhost:3001`
- **Purpose**: Super admin dashboard
- **Features**:
  - Super admin login (`/admin/login`)
  - Dashboard overview (`/admin/dashboard`)
  - Tenant management (`/admin/tenants`)
  - User management
  - System analytics

### Dashboard Subdomain
- **URL**: `http://dashboard.localhost:3001`
- **Purpose**: Tenant-specific dashboard
- **Features**:
  - Tenant dashboard
  - KYC management
  - API key management
  - User management (within tenant)
  - Verification sessions

## Subdomain Configuration

### Development (localhost)

For local development, you'll need to configure your hosts file to support subdomains:

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 localhost
127.0.0.1 admin.localhost
127.0.0.1 dashboard.localhost
```

**macOS/Linux** (`/etc/hosts`):
```
127.0.0.1 localhost
127.0.0.1 admin.localhost
127.0.0.1 dashboard.localhost
```

### Production

For production, you'll need to configure your DNS to point subdomains to your server:

```
admin.yourdomain.com -> your-server-ip
dashboard.yourdomain.com -> your-server-ip
```

## API Endpoints

### Admin Endpoints (Backend)

All admin endpoints are prefixed with `/admin`:

- `GET /admin/dashboard` - Get admin dashboard statistics
- `GET /admin/tenants` - Get all tenants with pagination
- `GET /admin/tenants/:id` - Get specific tenant details
- `PATCH /admin/tenants/:id/status` - Update tenant status
- `GET /admin/users` - Get all users with pagination
- `PATCH /admin/users/:id/status` - Update user status

### Frontend API Routes

The frontend includes proxy routes that forward requests to the backend:

- `/api/admin/dashboard` → Backend `/admin/dashboard`
- `/api/admin/tenants` → Backend `/admin/tenants`
- `/api/admin/tenants/[id]` → Backend `/admin/tenants/[id]`
- `/api/admin/tenants/[id]/status` → Backend `/admin/tenants/[id]/status`

## Authentication

### Super Admin Authentication

Super admins must have the `SUPER_ADMIN` role in the database. The system checks for this role on:

1. Login to admin subdomain
2. Access to admin dashboard
3. API calls to admin endpoints

### Tenant Authentication

Tenants access their dashboard through the dashboard subdomain. The system uses:

1. JWT tokens for authentication
2. Tenant-specific middleware for route protection
3. Role-based access control within tenants

## Security Features

1. **Subdomain Isolation**: Admin and tenant dashboards are completely separated
2. **Role-Based Access**: Different roles have different permissions
3. **Token Authentication**: JWT tokens for secure API access
4. **Middleware Protection**: Routes are protected by authentication middleware
5. **CORS Configuration**: Proper CORS setup for cross-origin requests

## Troubleshooting

### Common Issues

1. **Subdomains not working**: Check your hosts file configuration
2. **Authentication errors**: Verify user roles in the database
3. **API connection errors**: Check BACKEND_URL in environment variables
4. **CORS errors**: Ensure backend CORS is properly configured

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Next Steps

1. **Implement Token Verification**: Complete the `getUserIdFromToken` function in the super admin middleware
2. **Add More Admin Features**: Implement user creation, tenant creation, etc.
3. **Enhance Security**: Add rate limiting, audit logging, etc.
4. **Production Deployment**: Configure for production environment
