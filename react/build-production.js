#!/usr/bin/env node
/**
 * Production build script for Render.com deployment
 * This script ensures all production configurations are properly set
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production build for Render.com...');

// Ensure production environment
process.env.NODE_ENV = 'production';

try {
  // Check if production env file exists
  const prodEnvPath = path.join(__dirname, '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    console.log('✅ Production environment file found');
  } else {
    console.log('⚠️  Production environment file not found, creating default...');
    // Create a basic production env file
    const defaultProdEnv = `NODE_ENV=production
VITE_API_URL=https://x-clone-backend.onrender.com
GENERATE_SOURCEMAP=false
VITE_BUILD_MODE=production`;
    fs.writeFileSync(prodEnvPath, defaultProdEnv);
  }

  // Run the build
  console.log('📦 Building React application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify _redirects file is in dist
  const redirectsPath = path.join(__dirname, 'dist', '_redirects');
  if (fs.existsSync(redirectsPath)) {
    console.log('✅ SPA routing configuration (_redirects) is in place');
  } else {
    console.log('⚠️  SPA routing file missing, copying _redirects to dist...');
    const publicRedirectsPath = path.join(__dirname, 'public', '_redirects');
    if (fs.existsSync(publicRedirectsPath)) {
      fs.copyFileSync(publicRedirectsPath, redirectsPath);
      console.log('✅ _redirects file copied to dist folder');
    }
  }

  console.log('🎉 Production build completed successfully!');
  console.log('📁 Build output is in the "dist" folder');
  
} catch (error) {
  console.error('❌ Production build failed:', error.message);
  process.exit(1);
}