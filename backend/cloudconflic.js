const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Enhanced Cloudinary configuration for Render.com deployment
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true, // Use HTTPS URLs
  use_filename: true,
  unique_filename: false,
  overwrite: true,
});

// Enhanced Cloudinary configuration validation for Render.com
console.log('🔍 Cloudinary Environment Check for Render.com:');
console.log('CLOUD_NAME:', process.env.CLOUD_NAME ? '✅ SET' : '❌ MISSING');
console.log('CLOUD_API_KEY:', process.env.CLOUD_API_KEY ? '✅ SET' : '❌ MISSING');
console.log('CLOUD_API_SECRET:', process.env.CLOUD_API_SECRET ? '✅ SET' : '❌ MISSING');

if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error('❌ CRITICAL: Missing Cloudinary configuration for Render.com deployment');
  console.log('Required environment variables:');
  console.log('- CLOUD_NAME (currently:', process.env.CLOUD_NAME || 'NOT SET', ')');
  console.log('- CLOUD_API_KEY (currently:', process.env.CLOUD_API_KEY || 'NOT SET', ')'); 
  console.log('- CLOUD_API_SECRET (currently:', process.env.CLOUD_API_SECRET ? 'SET' : 'NOT SET', ')');
  console.log('Please set these in your Render.com environment variables dashboard');
} else {
  console.log('✅ Cloudinary configuration loaded successfully for Render.com deployment');
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
  console.log('📋 Validating file for Render.com upload:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: Math.round(file.size / 1024) + 'KB',
    fieldname: file.fieldname
  });

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    throw new Error('No file provided for upload');
  }
  
  if (!file.mimetype) {
    throw new Error('File mimetype is missing - invalid file');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    console.error('❌ Invalid file type on Render.com:', file.mimetype);
    throw new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`);
  }
  
  if (file.size > maxSize) {
    console.error('❌ File too large on Render.com:', Math.round(file.size / 1024 / 1024 * 100) / 100, 'MB');
    throw new Error(`File too large: ${Math.round(file.size / 1024 / 1024 * 100) / 100}MB. Maximum size is 5MB.`);
  }
  
  console.log('✅ File validation passed for Render.com upload');
  return true;
};

// Test Cloudinary connection function for Render.com
const testCloudinaryConnection = async () => {
  try {
    console.log('🔗 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection test successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error.message);
    console.error('This may cause image upload failures on Render.com');
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
