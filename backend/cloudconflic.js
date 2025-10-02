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

// Verify Cloudinary configuration
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error('Missing Cloudinary configuration. Please check environment variables.');
  console.log('Required: CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET');
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

// Helper function to validate image file
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }
  
  return true;
};

module.exports = {
  cloudinary,
  poststorage,
  profileImageStorage,
  profileCoverStorage,
  getProfileStorage,
  cleanupTempFile,
  validateImageFile,
};
