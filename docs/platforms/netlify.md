# Netlify Deployment Guide

Complete guide for deploying the International Electrical Calculator to Netlify.

## 🚀 Quick Start (30 seconds)

### Option 1: Drag & Drop Deploy
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to the deployment area
4. Get instant HTTPS URL

### Option 2: Git Integration (Recommended)
1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository at [netlify.com](https://netlify.com)
3. Automatic deployments on every push

### Option 3: CLI Deploy
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## 📋 Prerequisites

- Netlify account (free tier available)
- Git repository (for automatic deployments)
- Node.js 18+ for local builds

## 🌐 Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub/GitLab/Bitbucket
   - Select your repository

2. **Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20` (set in Environment variables)

3. **Deploy**:
   - Netlify automatically detects `netlify.toml` configuration
   - First deployment starts immediately
   - Subsequent deployments trigger on git push

### Method 2: CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build application
npm run build

# Deploy to staging
netlify deploy --dir=dist

# Deploy to production
netlify deploy --prod --dir=dist

# Deploy with custom message
netlify deploy --prod --dir=dist --message "Deploy v1.0.0 with IEC standards"
```

### Method 3: Manual Upload

1. **Build locally**:
```bash
npm run build
```

2. **Manual deploy**:
   - Go to [netlify.com](https://netlify.com)
   - Drag `dist` folder to deploy area
   - Get instant URL

## ⚙️ Configuration

### netlify.toml (Included)

The repository includes a complete `netlify.toml` configuration:

```toml
[build]
  publish = "dist"
  command = "npm run build"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    # ... additional security headers
```

### Environment Variables

Set in Netlify UI under **Site settings** → **Environment variables**:

```bash
# Build environment
NODE_VERSION=20
NPM_FLAGS=--prefix=/dev/null
NODE_ENV=production

# Custom environment variables (if needed)
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ANALYTICS_ID=your-analytics-id
```

### Build Settings

**Recommended settings**:
- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions` (if using)

## 🌍 Custom Domain Setup

### Add Custom Domain

1. **In Netlify Dashboard**:
   - Go to **Site settings** → **Domain management**
   - Click **Add custom domain**
   - Enter your domain: `calculator.yourdomain.com`

2. **DNS Configuration**:
   ```bash
   # Add CNAME record in your DNS provider
   CNAME calculator.yourdomain.com your-site-name.netlify.app
   
   # Or for apex domain, add A records
   A yourdomain.com 75.2.60.5
   A yourdomain.com 99.83.190.102
   A yourdomain.com 108.138.188.183
   A yourdomain.com 170.2.210.201
   ```

3. **SSL Certificate**:
   - Netlify automatically provisions Let's Encrypt SSL
   - Usually takes 1-5 minutes to activate
   - Force HTTPS in domain settings

### Subdomain Setup

For `calculator.yourdomain.com`:
```bash
# DNS CNAME record
CNAME calculator your-site-name.netlify.app
```

## 🔄 Continuous Deployment

### Branch Deploys

Configure different environments:

1. **Production** (main branch):
   - Branch: `main` or `master`
   - Deploy previews: Enabled
   - Auto-deploy: Enabled

2. **Staging** (develop branch):
   - Branch: `develop`
   - Deploy to: `staging--your-site.netlify.app`
   - Environment: `NODE_ENV=staging`

3. **Feature Branches**:
   - Deploy previews for all pull requests
   - Temporary URLs for testing

### Deploy Hooks

Create webhook for external triggers:

1. **In Netlify Dashboard**:
   - Go to **Site settings** → **Build & deploy**
   - Click **Add build hook**
   - Name: "Manual Deploy"
   - Branch: `main`

2. **Trigger deployment**:
```bash
curl -X POST -d {} https://api.netlify.com/build_hooks/YOUR_HOOK_ID
```

## 📊 Performance & Optimization

### Build Optimization

```toml
# netlify.toml optimizations
[build]
  command = "npm ci && npm run build"
  
[build.environment]
  NODE_VERSION = "20"
  NPM_CONFIG_PRODUCTION = "false"
  
# Build plugins
[[plugins]]
  package = "@netlify/plugin-lighthouse"
  
[[plugins]]
  package = "netlify-plugin-submit-sitemap"
  [plugins.inputs]
    baseUrl = "https://calculator.yourdomain.com"
    sitemapPath = "/sitemap.xml"
```

### Asset Optimization

Netlify automatically provides:
- **Gzip compression**: Enabled by default
- **Brotli compression**: Enabled for modern browsers
- **Image optimization**: Available with Netlify Large Media
- **CDN**: Global edge network

### Caching Strategy

Headers in `netlify.toml`:
```toml
# Long-term caching for assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Short-term caching for HTML
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600, must-revalidate"
```

## 🛠️ Advanced Features

### Form Handling (Optional)

Add contact forms with Netlify Forms:
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>
```

### Functions (Optional)

Create serverless functions in `netlify/functions/`:
```javascript
// netlify/functions/calculate.js
exports.handler = async (event, context) => {
  const { current, length, voltage } = JSON.parse(event.body);
  
  // Perform server-side calculations
  const result = calculateWireSize(current, length, voltage);
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
};
```

### Analytics Integration

Enable Netlify Analytics:
1. Go to **Site settings** → **Analytics**
2. Enable Netlify Analytics ($9/month)
3. Or integrate Google Analytics in your app

### A/B Testing

Configure split testing:
```toml
# netlify.toml
[[redirects]]
  from = "/"
  to = "/version-a"
  status = 200
  conditions = {Country = ["US"], Role = ["admin"]}

[[redirects]]
  from = "/"
  to = "/version-b"
  status = 200
  conditions = {Country = ["US"]}
```

## 🔒 Security Features

### Security Headers (Included)

The `netlify.toml` includes comprehensive security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Access Control

Restrict access to staging sites:
```toml
# Password protection
[[redirects]]
  from = "/admin/*"
  to = "/.netlify/functions/auth"
  status = 401
  force = true

# IP allowlist
[[headers]]
  for = "/staging/*"
  [headers.values]
    X-Frame-Options = "DENY"
  [headers.conditions]
    # Only allow specific IPs
```

## 💰 Pricing

### Free Tier
- **Bandwidth**: 100GB/month
- **Build minutes**: 300 minutes/month
- **Sites**: Unlimited
- **Form submissions**: 100/month
- **Perfect for**: Personal projects, portfolios

### Pro Tier ($19/month)
- **Bandwidth**: 1TB/month
- **Build minutes**: 3,000 minutes/month
- **Form submissions**: 1,000/month
- **Password protection**: Included
- **Perfect for**: Professional projects

### Business Tier ($99/month)
- **Bandwidth**: 2TB/month
- **Build minutes**: 25,000 minutes/month
- **SSO**: Included
- **Analytics**: Included
- **Perfect for**: Team projects, businesses

## 📊 Monitoring & Analytics

### Build Monitoring

Monitor deployments:
```bash
# Check deploy status
netlify status

# View deploy logs
netlify logs

# List all deploys
netlify api listSiteDeploys --data '{"site_id":"YOUR_SITE_ID"}'
```

### Performance Monitoring

Built-in tools:
- **Lighthouse scores**: Automatic performance audits
- **Core Web Vitals**: Loading, interactivity, visual stability
- **Real User Metrics**: Actual user performance data

### Error Tracking

Integrate with error tracking services:
```javascript
// Add to your app
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

## 🚨 Troubleshooting

### Common Issues

**Build Fails**:
```bash
# Check Node.js version in environment variables
NODE_VERSION=20

# Clear build cache
netlify build --clear-cache

# Debug locally
netlify dev
```

**White Screen / App Not Loading** (FIXED in 2025):
Our application was experiencing white screen issues on Netlify deployment. These have been resolved:

✅ **Fixed Issues**:
- **Content Security Policy**: Updated `netlify.toml` to allow Material-UI styles and scripts
- **Asset Paths**: Changed from absolute (`/assets/`) to relative (`./assets/`) paths in Vite config
- **Error Boundaries**: Added comprehensive error handling for lazy-loaded components
- **React 19 Compatibility**: Added fallback error handling in main.tsx
- **Metadata**: Fixed missing title and description tags

**If you still see a white screen**:
1. Check browser console for errors
2. Verify CSP is not blocking resources
3. Test locally with `npm run build && npm run preview`
4. Check that all lazy-loaded components load correctly

**Content Security Policy Issues**:
```toml
# Updated CSP in netlify.toml (already fixed)
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com data:; font-src 'self' https://fonts.gstatic.com data:;"
```

**Routing Issues**:
```toml
# Ensure SPA redirects are configured
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy Preview Not Working**:
- Check branch deploy settings
- Ensure pull request from allowed repositories
- Verify build command works locally

**Custom Domain SSL Issues**:
- Wait up to 24 hours for DNS propagation
- Check CNAME record configuration
- Verify domain ownership

### Debug Tools

```bash
# Local development
netlify dev

# Test functions locally
netlify functions:serve

# Check DNS configuration
dig calculator.yourdomain.com

# Test SSL certificate
openssl s_client -connect calculator.yourdomain.com:443
```

## 📞 Support Resources

- **Documentation**: https://docs.netlify.com/
- **Community**: https://community.netlify.com/
- **Support**: Available through Netlify dashboard
- **Status**: https://www.netlifystatus.com/

---

## 📋 Quick Commands Summary

```bash
# CLI deployment
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist

# Git deployment (after connecting repository)
git push origin main  # Automatic deployment

# Environment management
netlify env:set NODE_VERSION 20
netlify env:list

# Site management
netlify sites:list
netlify open
netlify logs
```

Your International Electrical Calculator is now ready for professional Netlify deployment with automatic HTTPS, global CDN, and continuous deployment! 🚀⚡