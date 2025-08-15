# AddisVerify Google Cloud Deployment Guide

This guide will help you deploy the AddisVerify dashboard application to Google Cloud Platform using Docker and Cloud Run.

## Prerequisites

1. **Google Cloud Account**: You need a Google Cloud account with billing enabled
2. **Google Cloud CLI**: Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
4. **Node.js**: Version 18 or higher (for local development)

## Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

#### For Windows:
```bash
# Set your project ID
set PROJECT_ID=your-google-cloud-project-id

# Run the deployment script
deploy.bat
```

#### For Linux/Mac:
```bash
# Set your project ID
export PROJECT_ID=your-google-cloud-project-id

# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

1. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Build and Push Docker Image**:
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/addisverify .
   docker push gcr.io/YOUR_PROJECT_ID/addisverify
   ```

4. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy addisverify \
     --image gcr.io/YOUR_PROJECT_ID/addisverify \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080 \
     --memory 1Gi \
     --cpu 1 \
     --max-instances 10 \
     --min-instances 0
   ```

## Environment Variables

Create a `.env` file in the root directory with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_AUTH_SERVICE_URL=https://your-auth-service.com

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_REGION=us-central1
```

## Configuration Options

### Cloud Run Configuration

The application is configured with the following Cloud Run settings:

- **Memory**: 1GB (suitable for most workloads)
- **CPU**: 1 vCPU
- **Max Instances**: 10 (auto-scaling)
- **Min Instances**: 0 (cost optimization)
- **Timeout**: 300 seconds
- **Concurrency**: 80 requests per instance
- **Port**: 8080

### Custom Domain (Optional)

To use a custom domain:

1. **Map your domain**:
   ```bash
   gcloud run domain-mappings create \
     --service addisverify \
     --domain your-domain.com \
     --region us-central1
   ```

2. **Update DNS records** as instructed by the command output

## Monitoring and Logging

### View Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=addisverify" --limit=50
```

### Monitor Performance
- Visit the [Cloud Run Console](https://console.cloud.google.com/run)
- Check the [Cloud Monitoring](https://console.cloud.google.com/monitoring) dashboard

## Scaling and Performance

### Auto-scaling
The application automatically scales based on:
- CPU utilization
- Memory usage
- Request volume

### Performance Optimization
- **CDN**: Consider using Cloud CDN for static assets
- **Caching**: Implement Redis for session storage
- **Database**: Use Cloud SQL for persistent data

## Security Considerations

1. **HTTPS**: Cloud Run automatically provides HTTPS
2. **Authentication**: Implement proper authentication mechanisms
3. **Environment Variables**: Store sensitive data in Secret Manager
4. **Network Security**: Configure VPC connectors if needed

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Dockerfile syntax
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Runtime Errors**:
   - Check Cloud Run logs
   - Verify environment variables
   - Ensure API endpoints are accessible

3. **Performance Issues**:
   - Monitor resource usage
   - Adjust memory/CPU allocation
   - Check for memory leaks

### Useful Commands

```bash
# View service details
gcloud run services describe addisverify --region=us-central1

# Update service configuration
gcloud run services update addisverify --region=us-central1 --memory=2Gi

# View recent logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=addisverify" --limit=20

# Delete service
gcloud run services delete addisverify --region=us-central1
```

## Cost Optimization

1. **Set minimum instances to 0** for development environments
2. **Use appropriate memory/CPU** allocation
3. **Monitor usage** with Cloud Billing alerts
4. **Consider reserved instances** for production workloads

## Support

For issues related to:
- **Google Cloud**: Check [Google Cloud Documentation](https://cloud.google.com/docs)
- **Next.js**: Visit [Next.js Documentation](https://nextjs.org/docs)
- **Docker**: Refer to [Docker Documentation](https://docs.docker.com/)

## Next Steps

After deployment:
1. Set up monitoring and alerting
2. Configure CI/CD pipeline
3. Implement backup strategies
4. Set up staging environment
5. Configure custom domain and SSL
