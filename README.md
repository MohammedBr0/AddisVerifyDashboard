# Adiss Verify Dashboard

A modern, comprehensive KYC (Know Your Customer) verification dashboard built with Next.js, TypeScript, and Tailwind CSS. This application provides a complete solution for identity verification, document processing, and user management.

## 🚀 Features

- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS
- **KYC Verification**: Complete identity verification workflow
- **Document Processing**: OCR and document validation
- **User Management**: Comprehensive user and tenant management
- **API Integration**: RESTful API with proper authentication
- **Real-time Updates**: Live status updates and notifications
- **Mobile Responsive**: Optimized for all device sizes
- **Dark Mode Support**: Beautiful dark and light themes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts (if needed)
- **Authentication**: Custom auth system

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MohammedBr0/AddisVerifyDashboard.git
   cd AddisVerifyDashboard/addisverify
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:8000`

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (authenticated)/   # Protected routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── kyc/          # KYC verification
│   │   ├── users/        # User management
│   │   └── ...
│   ├── auth/             # Authentication pages
│   ├── api/              # API routes
│   └── kyc/              # Public KYC pages
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   └── kyc/             # KYC-specific components
├── lib/                 # Utilities and services
│   ├── apiService/      # API service functions
│   └── utils/           # Helper functions
└── types/               # TypeScript type definitions
```

## 🎯 Key Features

### Dashboard
- **Overview**: Real-time statistics and metrics
- **Analytics**: User activity and verification trends
- **Quick Actions**: Fast access to common tasks
- **System Status**: Health monitoring and alerts

### KYC Verification
- **Document Upload**: Support for multiple document types
- **OCR Processing**: Automatic text extraction
- **Face Verification**: Liveness detection and face matching
- **Real-time Status**: Live progress updates
- **Mobile QR Code**: Easy mobile device integration

### User Management
- **User Profiles**: Complete user information management
- **Role-based Access**: Granular permissions system
- **Tenant Management**: Multi-tenant support
- **Activity Logs**: Comprehensive audit trails

### API Management
- **API Keys**: Secure key generation and management
- **Rate Limiting**: Built-in protection against abuse
- **Webhooks**: Real-time event notifications
- **Documentation**: Comprehensive API documentation

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:8000

# Optional: Analytics
NEXT_TELEMETRY_DISABLED=1
```

### API Integration

The application is designed to work with a backend API. Update the API endpoints in `src/lib/apiService/` to match your backend configuration.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Set Root Directory to `addisverify`
   - Deploy

2. **Set Environment Variables** in Vercel dashboard

3. **Access your live application**

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use the Next.js build command
- **Railway**: Direct deployment from GitHub
- **DigitalOcean App Platform**: Container deployment
- **AWS Amplify**: Full-stack deployment

## 📱 Mobile Support

The application includes a mobile-optimized KYC flow:

1. **QR Code Generation**: Generate QR codes for mobile access
2. **Mobile Verification**: Complete verification on mobile devices
3. **Responsive Design**: Optimized for all screen sizes
4. **Touch Interactions**: Mobile-friendly interface

## 🔒 Security Features

- **Authentication**: Secure login and session management
- **Authorization**: Role-based access control
- **Data Encryption**: Secure data transmission
- **Input Validation**: Comprehensive form validation
- **CSRF Protection**: Built-in security measures

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- **Optimized Builds**: Next.js automatic optimization
- **Code Splitting**: Automatic bundle splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Intelligent caching strategies
- **Lazy Loading**: Component and route lazy loading

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Report bugs on [GitHub Issues](https://github.com/MohammedBr0/AddisVerifyDashboard/issues)
- **Discussions**: Join the [GitHub Discussions](https://github.com/MohammedBr0/AddisVerifyDashboard/discussions)

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Next.js** for the amazing React framework
- **Vercel** for the deployment platform

---

**Built with ❤️ for secure identity verification**
