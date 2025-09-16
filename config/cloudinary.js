import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: "dqebaddyl",
  api_key: "878182459481493",
  api_secret: "8EvgD23ibxyhAsuSDagKZqs05Fg",
});


export const uploadToCloudinary = (fileBuffer, fileName = '', mimeType = '') => {
  return new Promise((resolve, reject) => {
    // Detect type
    let resourceType = 'raw'; // default for safety
    if (mimeType) {
      if (mimeType.startsWith('image/')) {
        resourceType = 'image';
      } else if (mimeType.startsWith('video/')) {
        resourceType = 'video';
      } else {
        resourceType = 'raw'; // pdf, docx, etc.
      }
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: fileName || undefined,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export { cloudinary };
