# GitHub Integration Setup Guide

## Overview

This guide helps you set up GitHub integration for automatic deployments of the International Electrical Calculator.

## Prerequisites

✅ Repository created at: `https://github.com/tomoflahti/electrical-calculator-app.git`
✅ Initial commit with all application files ready
✅ GitHub Actions workflows configured for master/main branches

## Required GitHub Secrets

To enable automatic deployments, configure these secrets in your GitHub repository:

### Go to: Settings → Secrets and variables → Actions → New repository secret

### 1. Netlify Integration
```bash
NETLIFY_AUTH_TOKEN=your_netlify_personal_access_token
NETLIFY_SITE_ID=your_site_id_from_netlify
NETLIFY_STAGING_SITE_ID=your_staging_site_id (optional)
```

**How to get these values:**
1. Go to [Netlify](https://app.netlify.com)
2. User settings → Applications → Personal access tokens → New access token
3. Copy the token for `NETLIFY_AUTH_TOKEN`
4. Go to your site → Site settings → General → Site information
5. Copy Site ID for `NETLIFY_SITE_ID`

### 2. Docker Hub (Optional)
```bash
DOCKERHUB_USERNAME=your_dockerhub_username
DOCKERHUB_TOKEN=your_dockerhub_access_token
```

### 3. AWS Deployment (Optional)
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_s3_bucket_name
CLOUDFRONT_DISTRIBUTION_ID=your_cloudfront_id
```

### 4. Security & Monitoring (Optional)
```bash
CODECOV_TOKEN=your_codecov_token
SNYK_TOKEN=your_snyk_token
SLACK_WEBHOOK_URL=your_slack_webhook_url
WEBPAGETEST_API_KEY=your_webpagetest_key
```

## GitHub Actions Workflows

### 1. Main Deployment Workflow (`deploy.yml`)
- **Triggers**: Push to master/main branches
- **Actions**: 
  - ✅ Run tests and build
  - ✅ Deploy to Netlify
  - ✅ Build Docker image
  - ✅ Deploy to AWS S3

### 2. Comprehensive CI/CD Pipeline (`ci-cd.yml`)
- **Triggers**: Push/PR to master/main/develop branches
- **Actions**:
  - ✅ Unit tests with coverage
  - ✅ E2E tests with Playwright
  - ✅ Security scanning
  - ✅ Performance monitoring
  - ✅ Multi-platform deployments

## Quick Setup Steps

### 1. Push to GitHub
```bash
# Authenticate with GitHub (choose one):
gh auth login                    # GitHub CLI
# OR use SSH/Personal Access Token

# Push the repository
git push -u origin master
```

### 2. Set up Netlify Auto-Deploy
1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20` (in Environment variables)

### 3. Configure GitHub Secrets
Add the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets to enable GitHub Actions deployment.

### 4. Test the Integration
```bash
# Make a small change and push
echo "# Test" >> README.md
git add README.md
git commit -m "Test GitHub Actions integration"
git push origin master
```

## Verification Checklist

After setup, verify these work:

- [ ] GitHub Actions runs on push to master
- [ ] Tests pass in GitHub Actions
- [ ] Build artifacts are created
- [ ] Netlify deployment succeeds
- [ ] Application loads at Netlify URL
- [ ] No console errors in browser

## Deployment Environments

### Production
- **Trigger**: Push to `master` branch
- **URL**: Your main Netlify site
- **Features**: Full CI/CD pipeline, security scans, performance monitoring

### Staging (Optional)
- **Trigger**: Push to `develop` branch  
- **URL**: Staging Netlify site
- **Features**: Deploy previews, testing environment

### Pull Request Previews
- **Trigger**: Pull requests to master
- **URL**: Temporary Netlify preview URLs
- **Features**: Review apps for testing changes

## Troubleshooting

### GitHub Actions Failing
1. Check the Actions tab in your GitHub repository
2. Review build logs for specific errors
3. Verify all required secrets are configured
4. Ensure package.json scripts exist (test:ci, build, lint)

### Netlify Deployment Issues
1. Verify `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are correct
2. Check Netlify site settings match workflow configuration
3. Review Netlify deploy logs for specific errors
4. Ensure `netlify.toml` configuration is correct

### Build Failures
1. Test locally: `npm run build`
2. Check for missing dependencies
3. Verify TypeScript compilation passes
4. Review ESLint configuration

## Support Resources

- **GitHub Actions**: https://docs.github.com/en/actions
- **Netlify Deploy**: https://docs.netlify.com/configure-builds/get-started/
- **Repository**: https://github.com/tomoflahti/electrical-calculator-app
- **Issues**: Create issues in the GitHub repository

## Next Steps

Once integration is working:

1. ✅ Monitor deployment success in GitHub Actions
2. ✅ Set up branch protection rules
3. ✅ Configure required status checks
4. ✅ Add team members with appropriate permissions
5. ✅ Set up monitoring and alerting
6. ✅ Consider staging environment for testing

Your International Electrical Calculator is now ready for continuous deployment! 🚀⚡