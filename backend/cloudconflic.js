// backend/cloudconflic.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// configure Cloudinary from env (must be set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Small helper storage engine that uploads directly to Cloudinary using upload_stream
class CloudinaryStorageEngine {
  constructor(opts = {}) {
    this.folder = opts.folder || '';
    // optional: default resource_type (image)
    this.resource_type = opts.resource_type || 'image';
  }

  _handleFile(req, file, cb) {
    // upload_stream expects a callback (error, result)
    const uploadOptions = {
      folder: this.folder,
      resource_type: this.resource_type,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) {
        // don't leak sensitive details
        console.error('Cloudinary upload error:', err && err.message ? err.message : err);
        return cb(err);
      }
      // multer expects at least a path property; add filename (public_id) so controllers can destroy
      cb(null, {
        path: result.secure_url,        // full URL (https)
        filename: result.public_id,    // Cloudinary public_id (use for destroy)
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
      });
    });

    // file.stream is a stream of file data from multer
    if (file && file.stream) {
      file.stream.pipe(uploadStream);
    } else if (file && file.buffer) {
      // fallback if some middleware put buffer on file
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } else {
      cb(new Error('No file stream available for Cloudinary upload'));
    }
  }

  _removeFile(req, file, cb) {
    // file.filename should be the public_id we stored above
    if (!file || !file.filename) return cb(null);
    cloudinary.uploader.destroy(file.filename, { resource_type: 'image' }, (err, result) => {
      if (err) {
        console.error('Cloudinary destroy error:', err && err.message ? err.message : err);
        return cb(err);
      }
      cb(null);
    });
  }
}

// Exported storages (instances) with folder names used in your app
const poststorage = new CloudinaryStorageEngine({ folder: process.env.CLOUDINARY_POST_FOLDER || 'x-clone/posts' });
const profileImageStorage = new CloudinaryStorageEngine({ folder: process.env.CLOUDINARY_PROFILE_IMAGE_FOLDER || 'x-clone/profile_images' });
const profileCoverStorage = new CloudinaryStorageEngine({ folder: process.env.CLOUDINARY_PROFILE_COVER_FOLDER || 'x-clone/profile_covers' });

// helper: return profile storage by type (keeps your existing API)
function getProfileStorage(type = 'image') {
  if (type === 'cover' || type === 'coverImage') return profileCoverStorage;
  return profileImageStorage;
}

// Export names exactly as your code expects
module.exports = {
  cloudinary,
  poststorage,
  profileImageStorage,
  profileCoverStorage,
  getProfileStorage,
};
