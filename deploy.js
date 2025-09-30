#!/usr/bin/env node

/**
 * Production Deployment Script for X-Clone
 * This script helps configure environment variables and deployment settings
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function deploymentSetup() {
  console.log('🚀 X-Clone Production Deployment Setup\n');

  try {
    // Collect deployment information
    const config = {};

    console.log('📝 Please provide the following deployment information:\n');

    // MongoDB Configuration
    config.MONGODB_URI_PROD = await question('Enter production MongoDB URI (mongodb+srv://...): ');
    
    // Google OAuth Configuration
    config.GOOGLE_CLIENT_ID = await question('Enter Google OAuth Client ID: ');
    config.GOOGLE_CLIENT_SECRET = await question('Enter Google OAuth Client Secret: ');
    
    // JWT & Session Secrets
    config.SESSION_SECRET = await question('Enter session secret (or press Enter for auto-generated): ') || generateSecureSecret();
    config.JWT_SECRET = await question('Enter JWT secret (or press Enter for auto-generated): ') || generateSecureSecret();
    
    // Email Configuration
    config.EMAIL_USER = await question('Enter email address for password reset (optional): ');
    if (config.EMAIL_USER) {
      config.EMAIL_PASS = await question('Enter email app password: ');
      config.EMAIL_SERVICE = await question('Enter email service (default: gmail): ') || 'gmail';
    }
    
    // Deployment URLs
    config.FRONTEND_URL_PROD = await question('Enter production frontend URL (https://...): ');
    config.BACKEND_URL_PROD = await question('Enter production backend URL (https://...): ');
    
    // Port
    config.PORT = await question('Enter production port (default: 3000): ') || '3000';

    // Generate production .env files
    await generateProductionEnv(config);
    
    console.log('\n✅ Deployment configuration completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Review the generated .env.production files');
    console.log('2. Deploy your backend to your chosen platform');
    console.log('3. Deploy your frontend with the production environment variables');
    console.log('4. Update your Google OAuth callback URLs in Google Console');
    console.log('5. Test the authentication flow in production\n');

  } catch (error) {
    console.error('❌ Error during deployment setup:', error.message);
  } finally {
    rl.close();
  }
}

function generateSecureSecret(length = 64) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

async function generateProductionEnv(config) {
  // Backend production .env
  const backendEnv = `# Production Environment Configuration
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=${config.MONGODB_URI_PROD}
MONGODB_URI_PROD=${config.MONGODB_URI_PROD}

# Google OAuth Configuration
GOOGLE_CLIENT_ID=${config.GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${config.GOOGLE_CLIENT_SECRET}

# Session & JWT Configuration
SESSION_SECRET=${config.SESSION_SECRET}
JWT_SECRET=${config.JWT_SECRET}

# Email Configuration
${config.EMAIL_USER ? `EMAIL_SERVICE=${config.EMAIL_SERVICE}\nEMAIL_USER=${config.EMAIL_USER}\nEMAIL_PASS=${config.EMAIL_PASS}` : '# Email configuration not provided'}

# Cloudinary Configuration (update these with your own)
CLOUD_NAME=dkqd9ects
CLOUD_API_KEY=819237941854538
CLOUD_API_SECRET=ifyGR1x0Y4qu4W8TNa5hh82rLZc

# Environment Configuration
PORT=${config.PORT}

# Frontend URL Configuration
FRONTEND_URL_PROD=${config.FRONTEND_URL_PROD}

# Backend URL Configuration  
BACKEND_URL_PROD=${config.BACKEND_URL_PROD}
`;

  // React production .env
  const reactEnv = `# Production Environment Configuration
NODE_ENV=production

# API base URL for production
VITE_API_URL=${config.BACKEND_URL_PROD}
VITE_API_URL_PROD=${config.BACKEND_URL_PROD}
`;

  // Write production .env files
  fs.writeFileSync(path.join(__dirname, 'backend', '.env.production'), backendEnv);
  fs.writeFileSync(path.join(__dirname, 'react', '.env.production'), reactEnv);
  
  console.log('📁 Generated files:');
  console.log('   - backend/.env.production');
  console.log('   - react/.env.production');
}

// Run the setup if this file is executed directly
if (require.main === module) {
  deploymentSetup();
}

module.exports = { deploymentSetup };