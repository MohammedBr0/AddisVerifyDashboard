# Adiss Verify Dashboard - GitHub Actions + Vercel Deployment Setup

This guide will help you set up automatic deployment to Vercel using GitHub Actions for the Adiss Verify Dashboard.

## 🚀 Quick Setup

### Step 1: Get Vercel Project Information

1. **Deploy your project to Vercel first** (if not already done):
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Set Root Directory to `addisverify`
   - Deploy the project

2. **Get your Vercel tokens and IDs**:
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link your project
   cd addisverify
   vercel link
   ```

3. **Get your Project ID and Org ID**:
   ```bash
   # This will show your project information
   vercel project ls
   ```

### Step 2: Create Vercel Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token (you'll need it for GitHub secrets)

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository: `MohammedBr0/AddisVerifyDashboard`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

   | Secret Name | Value |
   |-------------|-------|
   | `VERCEL_TOKEN` | Your Vercel token from Step 2 |
   | `VERCEL_ORG_ID` | Your organization ID |
   | `VERCEL_PROJECT_ID` | Your project ID |

### Step 4: Choose Your Workflow

You have two workflow options:

#### Option A: Simple Workflow (Recommended)
- Uses Vercel's official action
- Easier to set up and maintain
- File: `.github/workflows/deploy-vercel-simple.yml`

#### Option B: Advanced Workflow
- More control over the deployment process
- Includes testing and custom build steps
- File: `.github/workflows/deploy-vercel.yml`

## 🔧 Workflow Details

### Simple Workflow Features:
- ✅ **Automatic deployment** on push to master/main
- ✅ **Preview deployments** for pull requests
- ✅ **Caching** for faster builds
- ✅ **Working directory** set to `addisverify`
- ✅ **Production deployment** for main branch

### Advanced Workflow Features:
- ✅ **All simple features** plus:
- ✅ **Testing** (if tests exist)
- ✅ **Custom build process**
- ✅ **Environment-specific deployments**
- ✅ **Detailed logging**

## 📋 Required GitHub Secrets

### VERCEL_TOKEN
Your Vercel authentication token.

**How to get it:**
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Copy the generated token

### VERCEL_ORG_ID
Your Vercel organization ID.

**How to get it:**
```bash
vercel org ls
```

### VERCEL_PROJECT_ID
Your Vercel project ID.

**How to get it:**
```bash
vercel project ls
```

## 🎯 How It Works

### On Push to Main Branch:
1. **Trigger**: Code pushed to master/main
2. **Build**: Install dependencies and build the app
3. **Deploy**: Deploy to Vercel production
4. **Result**: Live application updated

### On Pull Request:
1. **Trigger**: Pull request created/updated
2. **Build**: Install dependencies and build the app
3. **Deploy**: Deploy to Vercel preview
4. **Result**: Preview URL for testing

## 🔍 Monitoring Deployments

### GitHub Actions:
- Go to your repository → **Actions** tab
- View workflow runs and logs
- Check deployment status

### Vercel Dashboard:
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Select your project
- View deployment history and logs

## 🚨 Troubleshooting

### Common Issues:

1. **Missing Secrets**:
   ```
   Error: Missing required secrets
   ```
   **Solution**: Add all required secrets in GitHub repository settings

2. **Build Failures**:
   ```
   Error: Build failed
   ```
   **Solution**: Check build logs and fix any issues in your code

3. **Permission Issues**:
   ```
   Error: Permission denied
   ```
   **Solution**: Ensure Vercel token has correct permissions

4. **Working Directory Issues**:
   ```
   Error: Cannot find package.json
   ```
   **Solution**: Verify the working directory is set to `addisverify`

### Debug Commands:
```bash
# Test build locally
cd addisverify
npm run build

# Test Vercel deployment locally
vercel --prod

# Check Vercel project status
vercel project ls
```

## 🔄 Workflow Customization

### Add Environment Variables:
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    working-directory: ./addisverify
    vercel-args: '--prod'
    alias-domains: 'your-domain.com'
```

### Add Notifications:
```yaml
- name: Notify on Success
  if: success()
  run: |
    echo "Deployment successful!"
    # Add your notification logic here

- name: Notify on Failure
  if: failure()
  run: |
    echo "Deployment failed!"
    # Add your notification logic here
```

## 📊 Performance Optimization

### Caching:
- **Node modules**: Cached between builds
- **Build artifacts**: Cached for faster deployments
- **Dependencies**: Only reinstalled when changed

### Build Optimization:
- **Parallel jobs**: Multiple steps run in parallel
- **Conditional deployment**: Only deploy when needed
- **Efficient caching**: Reduces build time

## 🎯 Next Steps

After setting up GitHub Actions:

1. **Test the workflow**: Push a small change to trigger deployment
2. **Monitor deployments**: Check both GitHub Actions and Vercel dashboards
3. **Set up notifications**: Add Slack/Discord notifications for deployments
4. **Optimize build time**: Review and optimize the build process
5. **Add testing**: Include automated tests in the workflow

## 📞 Support

- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Workflow Issues**: Check the Actions tab in your repository

---

**Your automated deployment pipeline is now ready!** 🚀
