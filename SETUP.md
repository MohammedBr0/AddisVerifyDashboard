# AD-DIS Verify Frontend Setup

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_KEY=your-stack-publishable-key

# Application
NEXT_PUBLIC_APP_NAME=AD-DIS Verify
NEXT_PUBLIC_APP_URL=http://localhost:8000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8000`

## 🔗 Backend Integration

The frontend is configured to connect to the AD-DIS-KYC backend service running on `http://localhost:3000`.

### API Endpoints Used:

#### Authentication
- `POST /auth/sign-up` - User registration
- `POST /auth/sign-in` - User login
- `GET /auth/me` - Get current user profile
- `PUT /auth/user` - Update user profile

#### User Management
- `GET /auth/user` - Get all users
- `POST /auth/user` - Create new user
- `PUT /auth/user/:id` - Update user
- `DELETE /auth/user/:id` - Delete user

#### Tenant Management
- `POST /client/tenant` - Create tenant
- `GET /client/tenant` - Get tenant info
- `PUT /client/tenant` - Update tenant

## 🎯 Features

### ✅ Implemented
- Modern landing page with hero section
- Authentication (login/register) with real API integration
- Dashboard with analytics and user management
- Responsive design with shadcn/ui components
- State management with Zustand
- API service layer with axios

### 🔄 In Progress
- KYC verification interface
- API key management
- User profile management
- Tenant management interface

## 🛠 Development

### Available Scripts

```bash
# Development server (port 8000)
npm run dev

# Build for production
npm run build

# Start production server (port 8000)
npm start

# Lint code
npm run lint
```

### Project Structure

```
addisverify/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── dashboard/         # Dashboard pages
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   └── ui/               # shadcn/ui components
│   └── lib/                  # Utility functions
│       ├── api.ts            # API service layer
│       └── store.ts          # Zustand state management
├── public/                   # Static assets
└── package.json
```

## 🔐 Authentication Flow

1. **Registration**: User signs up with email, password, and company info
2. **Login**: User authenticates with email/password
3. **Profile**: Fetches user profile from `/auth/me` endpoint
4. **Dashboard**: Protected area with user management and analytics

## 🌐 API Integration

The frontend integrates with the AD-DIS-KYC backend using:

- **Axios** for HTTP requests
- **JWT tokens** for authentication
- **Stack Auth** integration for user management
- **Multi-tenant** architecture support

### Headers Used

```javascript
// Authentication headers
Authorization: Bearer <access_token>
X-Stack-Access-Token: <access_token>
```

## 🎨 Design System

- **Colors**: Blue primary (#3B82F6), slate grays
- **Typography**: Inter font family
- **Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Responsive**: Mobile-first design

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflict**: The app runs on port 8000 to avoid conflicts with backend (3000)
2. **API Connection**: Ensure backend is running on `http://localhost:3000`
3. **Environment Variables**: Check `.env.local` file exists with correct values

### Development Tips

- Use browser dev tools to inspect API requests
- Check network tab for API errors
- Verify authentication tokens in localStorage
- Test responsive design on different screen sizes

## 📝 Notes

- The frontend is designed to work with the AD-DIS-KYC backend
- Authentication uses Stack Auth integration
- Multi-tenant support is built-in
- All components are accessible and responsive
- TypeScript provides full type safety

---

For more information, see the main README.md file. 