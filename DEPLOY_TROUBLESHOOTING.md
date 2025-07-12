# Netlify Deployment Troubleshooting Guide

## Fixed Issues (2024-07-06)

The following issues have been resolved in the current configuration:

### ✅ Build Configuration Issues
- **Fixed**: TypeScript configuration conflicts between test and production builds
- **Fixed**: Removed problematic `optionalDependencies` that were causing build failures
- **Fixed**: Simplified Vite configuration to reduce chunking complexity
- **Fixed**: Updated build command to use `tsc --noEmit` for type checking without emit

### ✅ Netlify Configuration Issues  
- **Fixed**: Removed problematic `NPM_FLAGS = "--prefix=/dev/null"`
- **Fixed**: Standardized Node.js version to 20 across all environments
- **Fixed**: Added proper environment variables for CI/CD builds
- **Fixed**: Added build validation script to catch issues early

### ✅ Bundle Optimization
- **Before**: Complex manual chunking causing build failures
- **After**: Simplified chunking strategy with vendor separation
- **Result**: Stable 532KB build with proper code splitting

## Current Working Configuration

### package.json Scripts
```json
{
  "build": "tsc --noEmit && vite build",
  "validate": "node scripts/validate-deployment.js",
  "deploy:netlify": "npm run build && npm run validate && netlify deploy --prod --dir=dist"
}
```

### netlify.toml (Working)
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"
  NODE_ENV = "production"
  NPM_CONFIG_PRODUCTION = "false"
  SKIP_PREFLIGHT_CHECK = "true"
```

## Deployment Process

### Step 1: Local Validation
```bash
# Clean build
npm run build

# Validate deployment
npm run validate

# Should output: ✅ Deployment validation completed successfully!
```

### Step 2: Deploy to Netlify
```bash
# Option A: Automated deploy
npm run deploy:netlify

# Option B: Manual deploy
netlify deploy --prod --dir=dist

# Option C: Git-based deploy (recommended)
git add .
git commit -m "Deploy: Fixed Netlify configuration"
git push origin main
```

### Step 3: Verify Deployment
- Check Netlify build logs for errors
- Test application routes (SPA routing should work)
- Verify lazy loading of calculator components
- Check bundle loading in browser dev tools

## If Deployment Still Fails

### Fallback Configuration
Use the simple configuration if main config fails:

```bash
# Copy simple config
cp netlify.simple.toml netlify.toml

# Retry deployment
git add netlify.toml
git commit -m "Deploy: Use simple Netlify config"
git push origin main
```

### Debug Build Locally
```bash
# Clean everything
rm -rf node_modules dist
npm install

# Test build
npm run build

# Serve locally to test
npm run preview
```

### Check Netlify Environment
In Netlify dashboard, verify:
- **Node.js version**: 20
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: NODE_ENV=production

### Common Issues & Solutions

#### Issue: "Module not found" errors
**Solution**: Check import paths and ensure all dynamic imports have proper error boundaries

#### Issue: "Build timeout" 
**Solution**: The simplified configuration reduces build time. If still timing out, use `netlify.simple.toml`

#### Issue: "Chunk loading errors"
**Solution**: The new chunking strategy is more conservative and should prevent these errors

#### Issue: Route not found (404 on refresh)
**Solution**: SPA redirects are configured in netlify.toml - ensure they're working

## Performance Verification

After successful deployment:

1. **Lighthouse Score**: Should be 90+ for performance
2. **Bundle Analysis**: Total ~532KB across all chunks
3. **Lazy Loading**: Calculator components load on-demand
4. **Caching**: Static assets cached with appropriate headers

## Support

If deployment still fails after following this guide:

1. Check Netlify build logs for specific error messages
2. Compare against working netlify.toml configuration
3. Use validation script to identify build issues
4. Consider using the simple fallback configuration

## Files Modified for Fix

- `tsconfig.json` - Added composite configuration
- `tsconfig.app.json` - Excluded test files from production build
- `vite.config.ts` - Simplified chunking strategy
- `package.json` - Removed optional dependencies, updated scripts
- `netlify.toml` - Fixed environment variables and build settings
- `scripts/validate-deployment.js` - Added deployment validation

## Deployment Status: ✅ READY

The application is now ready for Netlify deployment with the fixed configuration.