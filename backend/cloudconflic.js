const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Enhanced Cloudinary configuration for Render.com deployment
const cloudinaryConfig = {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true, // Use HTTPS URLs
  use_filename: true,
  unique_filename: false,
  overwrite: true,
};

// Only configure Cloudinary if all required variables are present
if (process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET) {
  cloudinary.config(cloudinaryConfig);
} else {
  console.error('❌ CRITICAL: Cloudinary not configured - missing environment variables');
}

// Verify Cloudinary configuration with detailed logging for Render.com
console.log('🔧 Cloudinary Environment Check:');
console.log('CLOUD_NAME:', process.env.CLOUD_NAME ? `SET (${process.env.CLOUD_NAME})` : '❌ MISSING');
console.log('CLOUD_API_KEY:', process.env.CLOUD_API_KEY ? `SET (${process.env.CLOUD_API_KEY.substring(0, 6)}...)` : '❌ MISSING');
console.log('CLOUD_API_SECRET:', process.env.CLOUD_API_SECRET ? 'SET (hidden)' : '❌ MISSING');

if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error('❌ CRITICAL: Missing Cloudinary configuration for Render.com deployment');
  console.log('📋 Required environment variables in Render.com dashboard:');
  console.log('   - CLOUD_NAME = dkqd9ects');
  console.log('   - CLOUD_API_KEY = 819237941854538');
  console.log('   - CLOUD_API_SECRET = ifyGR1x0Y4qu4W8TNa5hh82rLZc');
  console.log('💡 Go to Render.com → Your Service → Environment → Add these variables');
} else {
  console.log('✅ Cloudinary configuration loaded successfully for Render.com');
  console.log('   📁 Cloud Name:', process.env.CLOUD_NAME);
  console.log('   🔑 API Key configured');
  console.log('   🔐 API Secret configured');
}

// Storage for posts - optimized for Render.com
const poststorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    resource_type: "auto",
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" }
    ]
  },
});

// Storage for profile images - optimized for Render.com
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_images",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    resource_type: "auto",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "auto" }
    ]
  },
});

// Storage for profile covers - optimized for Render.com
const profileCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_covers",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    resource_type: "auto",
    transformation: [
      { width: 1500, height: 500, crop: "fill" },
      { quality: "auto" },
      { fetch_format: "auto" }
    ]
  },
});

// Dynamic storage selector (based on fieldname) - optimized for Render.com
function getProfileStorage(req, file, cb) {
  let storage;
  if (file.fieldname === "Image") {
    storage = profileImageStorage;
  } else if (file.fieldname === "cover") {
    storage = profileCoverStorage;
  } else {
    storage = poststorage;
  }
  cb(null, storage);
}

// Helper function to clean up temporary files (for Render.com)
const cleanupTempFile = (filePath) => {
  if (filePath && require('fs').existsSync(filePath)) {
    try {
      require('fs').unlinkSync(filePath);
    } catch (error) {
      console.log('Temp file cleanup (non-critical):', error.message);
    }
  }
};

// Enhanced helper function to validate image file for Render.com
const validateImageFile = (file) => {
  console.log('Validating file for Render.com:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    fieldname: file.fieldname
  });

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (!file.mimetype) {
    throw new Error('File mimetype is missing');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    console.error('Invalid file type on Render.com:', file.mimetype);
    throw new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`);
  }
  
  if (file.size > maxSize) {
    console.error('File too large on Render.com:', file.size, 'bytes');
    throw new Error(`File too large: ${Math.round(file.size / 1024 / 1024 * 100) / 100}MB. Maximum size is 5MB.`);
  }
  
  console.log('✅ File validation passed for Render.com');
  return true;
};

// Helper function to test Cloudinary connection for Render.com with improved error handling
const testCloudinaryConnection = async () => {
  try {
    console.log('🔍 Testing Cloudinary connection with configuration:', {
      cloud_name: process.env.CLOUD_NAME || 'NOT SET',
      api_key: process.env.CLOUD_API_KEY ? `${process.env.CLOUD_API_KEY.substring(0, 6)}...` : 'NOT SET',
      api_secret: process.env.CLOUD_API_SECRET ? 'SET (hidden)' : 'NOT SET'
    });

    // First check if all required config is present
    if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
      console.error('❌ Missing Cloudinary environment variables for Render.com');
      console.log('💡 Please set these environment variables in Render.com dashboard:');
      console.log('   CLOUD_NAME = dkqd9ects');
      console.log('   CLOUD_API_KEY = 819237941854538');
      console.log('   CLOUD_API_SECRET = ifyGR1x0Y4qu4W8TNa5hh82rLZc');
      return false;
    }

    // Test the configuration by making a small API call
    console.log('🔌 Testing Cloudinary API connection...');
    
    // Use a simpler API call that's more likely to succeed
    const pingResult = await cloudinary.api.ping();
    
    if (pingResult && pingResult.status === 'ok') {
      console.log('✅ Cloudinary connection test successful on Render.com');
      console.log('   - API Status: OK');
      console.log('   - Ready for image uploads');
      return true;
    } else {
      console.log('⚠️ Cloudinary ping succeeded but status unclear:', pingResult);
      return false;
    }
  } catch (error) {
    console.error('❌ Cloudinary connection test failed on Render.com:', error?.message || 'Unknown error');
    
    // More specific error handling for Render.com deployment
    if (error?.http_code) {
      console.error(`   - HTTP Error ${error.http_code}:`, error.message);
      if (error.http_code === 401) {
        console.error('   ⚠️ Authentication failed - Check CLOUD_API_KEY and CLOUD_API_SECRET');
      } else if (error.http_code === 400) {
        console.error('   ⚠️ Bad request - Check CLOUD_NAME');
      } else if (error.http_code === 403) {
        console.error('   ⚠️ Forbidden - Check account permissions and quotas');
      }
    } else if (error?.code) {
      console.error(`   - Network Error ${error.code}:`, error.message);
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error('   ⚠️ Cannot reach Cloudinary servers - Check network connectivity');
      }
    } else {
      console.error('   - Unknown error type:', error);
    }
    
    console.log('💡 Troubleshooting tips for Render.com:');
    console.log('   1. Verify environment variables are set correctly');
    console.log('   2. Check Cloudinary account status and quotas');
    console.log('   3. Ensure API credentials are active');
    
    return false;
  }
};

module.exports = {
  cloudinary,
  poststorage,
  profileImageStorage,
  profileCoverStorage,
  getProfileStorage,
  cleanupTempFile,
  validateImageFile,
  testCloudinaryConnection,
};
