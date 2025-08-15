# AddisVerify Vercel Deployment Guide

This guide will help you deploy the AddisVerify dashboard application to Vercel, which provides optimized hosting for Next.js applications.

## 🚀 Quick Deployment

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from the root directory** (where the main vercel.json is located):
   ```bash
   # Navigate to the root directory (authService)
   cd ..
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name (e.g., `addisverify`)
   - Confirm deployment settings

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub** (already done)
2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
3. **Click "New Project"**
4. **Import your GitHub repository**: `MohammedBr0/AddisVerifyDashboard`
5. **Configure project settings**:
   - Framework Preset: Next.js
   - Root Directory: `addisverify` ⭐ **IMPORTANT: Set this to `addisverify`**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
6. **Click "Deploy"**

### Option 3: Deploy via Vercel Dashboard

1. **Visit [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Upload your project folder** or connect to Git repository
4. **Configure settings and deploy**

## ⚙️ Environment Variables

Set these environment variables in your Vercel project dashboard:

### Required Environment Variables:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_AUTH_SERVICE_URL=https://your-auth-service.com

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app

# Optional: Analytics
NEXT_TELEMETRY_DISABLED=1
```

### How to Set Environment Variables:

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add each variable** with the appropriate value
4. **Redeploy** your application

## 🔧 Configuration Details

### Vercel Configuration Files:
- **Root `vercel.json`**: Specifies the `addisverify` subdirectory as the project root
- **`addisverify/vercel.json`**: Contains security headers and environment variables

### Next.js Optimizations
- **Image Optimization**: Enabled with Vercel's CDN
- **Bundle Optimization**: Vendor chunk splitting
- **CSS Optimization**: Experimental CSS optimization
- **Compression**: Enabled for better performance

## 📊 Performance Features

### Automatic Optimizations:
- ✅ **Edge Network**: Global CDN for fast loading
- ✅ **Image Optimization**: Automatic WebP/AVIF conversion
- ✅ **Bundle Analysis**: Automatic code splitting
- ✅ **Caching**: Intelligent caching strategies
- ✅ **HTTPS**: Automatic SSL certificates

### Performance Monitoring:
- **Real-time Analytics**: View performance metrics
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Function Logs**: Monitor API route performance

## 🔄 Continuous Deployment

### Automatic Deployments:
- **GitHub Integration**: Automatic deployment on push to main branch
- **Preview Deployments**: Automatic preview for pull requests
- **Branch Deployments**: Deploy different branches to different URLs

### Deployment Workflow:
1. **Push to GitHub** → Automatic deployment
2. **Preview URL** generated for testing
3. **Production deployment** when merged to main

## 🛠️ Custom Domain Setup

### Add Custom Domain:
1. **Go to Vercel Dashboard → Domains**
2. **Add your domain** (e.g., `addisverify.com`)
3. **Configure DNS records** as instructed
4. **Wait for DNS propagation** (up to 48 hours)

### SSL Certificate:
- **Automatic**: Vercel provides free SSL certificates
- **Wildcard Support**: Available on Pro plan
- **Force HTTPS**: Automatically redirects HTTP to HTTPS

## 📈 Monitoring and Analytics

### Vercel Analytics:
- **Page Views**: Track user engagement
- **Performance**: Monitor Core Web Vitals
- **Errors**: Automatic error tracking
- **Real-time**: Live user activity

### Logs and Debugging:
```bash
# View function logs
vercel logs

# View deployment logs
vercel logs --follow

# Debug local development
vercel dev
```

## 🔒 Security Features

### Built-in Security:
- **HTTPS**: Automatic SSL certificates
- **Security Headers**: XSS protection, content type options
- **CORS**: Configured for API routes
- **Rate Limiting**: Built-in protection against abuse

### Environment Variables:
- **Encrypted**: All environment variables are encrypted
- **Scoped**: Can be set per environment (production/preview)
- **Audit Log**: Track changes to environment variables

## 💰 Pricing and Limits

### Free Tier (Hobby):
- **Bandwidth**: 100GB/month
- **Function Execution**: 100GB-hours/month
- **Build Minutes**: 100 minutes/day
- **Custom Domains**: Unlimited
- **SSL Certificates**: Free

### Pro Plan ($20/month):
- **Bandwidth**: 1TB/month
- **Function Execution**: 1000GB-hours/month
- **Build Minutes**: 400 minutes/day
- **Team Collaboration**: Up to 10 members
- **Advanced Analytics**: Included

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**:
   ```bash
   # Check build logs
   vercel logs --build
   
   # Test build locally
   cd addisverify && npm run build
   ```

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names (case-sensitive)
   - Redeploy after adding variables

3. **API Routes Not Working**:
   - Check function timeout settings
   - Verify CORS configuration
   - Check serverless function logs

4. **Performance Issues**:
   - Enable Vercel Analytics
   - Check Core Web Vitals
   - Optimize images and bundles

### Useful Commands:
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View project info
vercel ls

# Remove project
vercel remove

# Update project settings
vercel env add
```

## 📱 Mobile Optimization

### Progressive Web App (PWA):
- **Service Workers**: Automatic caching
- **Offline Support**: Available with PWA setup
- **App-like Experience**: Installable on mobile devices

### Mobile Performance:
- **Responsive Design**: Optimized for all screen sizes
- **Touch Interactions**: Optimized for mobile devices
- **Fast Loading**: Optimized for mobile networks

## 🔄 Rollback and Versioning

### Deployment History:
- **Automatic Versioning**: Every deployment creates a version
- **Instant Rollback**: Rollback to any previous version
- **Preview Deployments**: Test changes before production

### Rollback Process:
1. **Go to Vercel Dashboard → Deployments**
2. **Select previous deployment**
3. **Click "Promote to Production"**
4. **Confirm rollback**

## 🎯 Next Steps

After successful deployment:

1. **Set up monitoring** with Vercel Analytics
2. **Configure custom domain** for branding
3. **Set up team collaboration** for development
4. **Implement CI/CD** with GitHub integration
5. **Monitor performance** and optimize as needed

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Support**: Available on Pro plan and above

---

**Your AddisVerify application is now ready for Vercel deployment!** 🚀
