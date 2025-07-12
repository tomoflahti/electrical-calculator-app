#!/usr/bin/env node

/**
 * Netlify Deployment Validation Script
 * Validates that the build is ready for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const REQUIRED_FILES = [
  'index.html',
  'vite.svg'
];

const REQUIRED_ASSET_PATTERNS = [
  /index-.*\.js$/,
  /index-.*\.css$/,
  /mui-.*\.js$/,
  /react-vendor-.*\.js$/
];

function validateDeployment() {
  console.log('🔍 Validating deployment build...\n');

  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist directory does not exist');
    process.exit(1);
  }

  // Check required files
  console.log('📁 Checking required files...');
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(DIST_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required file missing: ${file}`);
      process.exit(1);
    }
    console.log(`✅ ${file}`);
  }

  // Check assets directory
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.error('❌ assets directory does not exist');
    process.exit(1);
  }

  // Check required asset patterns
  console.log('\n🎯 Checking required assets...');
  const assetFiles = fs.readdirSync(assetsDir);
  
  for (const pattern of REQUIRED_ASSET_PATTERNS) {
    const matchingFiles = assetFiles.filter(file => pattern.test(file));
    if (matchingFiles.length === 0) {
      console.error(`❌ No asset matching pattern: ${pattern}`);
      process.exit(1);
    }
    console.log(`✅ ${pattern.toString()}: ${matchingFiles[0]}`);
  }

  // Validate index.html
  console.log('\n📄 Validating index.html...');
  const indexPath = path.join(DIST_DIR, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  if (!indexContent.includes('<div id="root">')) {
    console.error('❌ index.html missing root div');
    process.exit(1);
  }

  if (!indexContent.includes('type="module"')) {
    console.error('❌ index.html missing module script');
    process.exit(1);
  }

  console.log('✅ index.html structure valid');

  // Check for lazy loading compatibility
  console.log('\n⚡ Checking build compatibility...');
  const mainJsFile = assetFiles.find(file => /index-.*\.js$/.test(file));
  if (mainJsFile) {
    const mainJsPath = path.join(assetsDir, mainJsFile);
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Check for dynamic imports (lazy loading)
    if (mainJsContent.includes('import(')) {
      console.log('✅ Dynamic imports detected (lazy loading)');
    }

    // Check for React lazy
    if (mainJsContent.includes('lazy')) {
      console.log('✅ React lazy detected');
    }
  }

  // Size analysis
  console.log('\n📊 Bundle size analysis...');
  let totalSize = 0;
  
  assetFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ${file}: ${sizeKB} KB`);
    totalSize += stats.size;
  });

  const totalSizeKB = (totalSize / 1024).toFixed(2);
  console.log(`   Total: ${totalSizeKB} KB`);

  if (totalSize > 2 * 1024 * 1024) { // 2MB
    console.warn('⚠️  Bundle size is quite large (>2MB)');
  }

  console.log('\n✅ Deployment validation completed successfully!');
  console.log('\n🚀 Ready for Netlify deployment');
  console.log('   Command: npm run deploy:netlify');
  console.log('   Or: netlify deploy --prod --dir=dist');
}

try {
  validateDeployment();
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}