const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const poststorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'posts',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    }
});

const profileImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_images',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    }
});

const profileCoverStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_covers',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    }
});

function getProfileStorage(req, file, cb) {
    let storage;
    if (file.fieldname === 'Image') {
        storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'profile_images',
                allowed_formats: ['jpg', 'png', 'jpeg'],
            }
        });
    } else if (file.fieldname === 'cover') {
        storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'profile_covers',
                allowed_formats: ['jpg', 'png', 'jpeg'],
            }
        });
    } else {
        storage = poststorage;
    }
    cb(null, storage);
}

module.exports = {
    cloudinary,
    poststorage,
    profileImageStorage,
    profileCoverStorage,
    getProfileStorage
};