import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

/**
 * Upload a file Buffer or Base64 data string to Cloudinary
 */
export async function uploadToCloudinary(
  fileBufferOrBase64: Buffer | string,
  options?: {
    folder?: string;
    publicId?: string;
    tags?: string[];
  }
): Promise<CloudinaryUploadResponse> {
  const folder = options?.folder || 'ecom-unified/products';

  if (!isCloudinaryConfigured) {
    // If Cloudinary credentials are not configured yet, return a graceful response
    if (typeof fileBufferOrBase64 === 'string' && fileBufferOrBase64.startsWith('data:image')) {
      // Direct base64 image data URL can be used as fallback preview
      return {
        success: true,
        url: fileBufferOrBase64,
        publicId: `mock_${Date.now()}`,
        format: 'webp',
      };
    }

    return {
      success: false,
      url: '',
      error: 'Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured.',
    };
  }

  try {
    if (Buffer.isBuffer(fileBufferOrBase64)) {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            public_id: options?.publicId,
            tags: options?.tags || ['ecommerce', 'product'],
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error || !result) {
              resolve({
                success: false,
                url: '',
                error: error?.message || 'Failed to upload image to Cloudinary',
              });
            } else {
              resolve({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
              });
            }
          }
        );
        uploadStream.end(fileBufferOrBase64);
      });
    } else {
      // Base64 or remote URL string
      const result = await cloudinary.uploader.upload(fileBufferOrBase64, {
        folder,
        resource_type: 'auto',
        public_id: options?.publicId,
        tags: options?.tags || ['ecommerce', 'product'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      url: '',
      error: error?.message || 'Cloudinary upload error',
    };
  }
}

export default cloudinary;
