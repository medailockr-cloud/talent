import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary only if URL is provided
if (process.env.CLOUDINARY_URL) {
  // Cloudinary parses the CLOUDINARY_URL automatically if present
  console.log('Cloudinary is enabled.');
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'talent_app_videos',
      resource_type: 'video', // allows video uploads
      allowed_formats: ['mp4', 'mov', 'avi']
    };
  },
});

export const cloudUpload = process.env.CLOUDINARY_URL ? multer({ storage: storage }) : null;
