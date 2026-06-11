const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer, folderName = 'hostel_assets') => {
  return new Promise((resolve, reject) => {
    if (typeof fileData === 'string' && fileData.startsWith('data:image')) {
        cloudinary.uploader.upload(fileData, { folder: '/complaintsImages' }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
    }
    else{  const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      // End the stream with the buffer data
      uploadStream.end(fileBuffer);
    }
  });
};

module.exports = { cloudinary, uploadToCloudinary };