# AD-DIS Verify Frontend

A modern, responsive React application for the AD-DIS-KYC authentication and verification portal, built with Next.js and shadcn/ui.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with shadcn/ui components
- **Authentication**: Complete login and registration flows
- **Dashboard**: Comprehensive dashboard with analytics and user management
- **KYC Verification**: Interface for identity verification processes
- **API Management**: Secure API key generation and management
- **Multi-tenant Support**: Designed for enterprise multi-tenant architecture
- **TypeScript**: Full type safety and better developer experience

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks + Zustand (planned)
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API communication

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_KEY=your-stack-publishable-key

# Application
NEXT_PUBLIC_APP_NAME=AD-DIS Verify
```

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3001`

## 📁 Project Structure

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
├── public/                   # Static assets
└── package.json
```

## 🎨 UI Components

The application uses shadcn/ui components for a consistent and modern design:

- **Button**: Various button styles and states
- **Card**: Content containers with headers and descriptions
- **Input**: Form inputs with labels and validation
- **Badge**: Status indicators and labels
- **Avatar**: User profile images
- **And more...**

## 🔐 Authentication Flow

1. **Landing Page**: Modern hero section with feature highlights
2. **Login**: Secure authentication with email/password
3. **Registration**: Multi-step account creation with company details
4. **Dashboard**: Protected area with user management and analytics

## 📊 Dashboard Features

- **Overview**: Key metrics and recent activity
- **User Management**: Add, edit, and manage team members
- **KYC Verification**: Process identity verification requests
- **API Keys**: Generate and manage API access keys

## 🎯 Key Pages

### Landing Page (`/`)
- Hero section with value proposition
- Feature highlights
- Call-to-action buttons
- Professional footer

### Login (`/auth/login`)
- Clean authentication form
- Password visibility toggle
- Remember me functionality
- Forgot password link

### Registration (`/auth/register`)
- Multi-step registration process
- Company information collection
- Terms and conditions acceptance
- Success confirmation

### Dashboard (`/dashboard`)
- Overview with key metrics
- Tabbed navigation
- Recent activity feed
- Quick action cards

## 🔧 Development

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## 🌐 API Integration

The frontend is designed to integrate with the AD-DIS-KYC backend API:

- **Authentication**: JWT-based authentication
- **User Management**: CRUD operations for users
- **KYC Verification**: Document upload and verification
- **API Keys**: Secure key generation and management

## 🎨 Design System

The application follows a consistent design system:

- **Colors**: Blue primary, slate grays, semantic colors
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable, accessible UI components

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet**: Responsive layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Accessibility**: WCAG 2.1 compliant

## 🔒 Security Features

- **CSRF Protection**: Built-in Next.js protection
- **Input Validation**: Client and server-side validation
- **Secure Headers**: Security headers configuration
- **HTTPS**: Production-ready HTTPS support

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
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- **Documentation**: Check the README and inline comments
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

---

Built with ❤️ using Next.js and shadcn/ui
