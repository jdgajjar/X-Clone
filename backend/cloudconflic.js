const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Storage for posts
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    resource_type: "image",
    transformation: [{ width: 1200, height: 630, crop: "limit", quality: "auto" }]
  },
});

// Storage for profile images  
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_images",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    resource_type: "image",
    transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }]
  },
});

// Storage for profile covers
const profileCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_covers", 
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    resource_type: "image",
    transformation: [{ width: 1200, height: 400, crop: "fill", quality: "auto" }]
  },
});

module.exports = {
  cloudinary,
  postStorage,
  profileImageStorage,
  profileCoverStorage,
};
