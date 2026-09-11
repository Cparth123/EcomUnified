import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let fileBuffer: Buffer | null = null;
    let base64String: string | null = null;
    let folder = 'ecom-unified/products';
    let fileName: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const customFolder = formData.get('folder') as string | null;
      if (customFolder) folder = customFolder;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided in form data' },
          { status: 400 }
        );
      }

      // Check mime type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Only image files (JPEG, PNG, WebP, SVG) are supported' },
          { status: 400 }
        );
      }

      // Max size check: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds 10MB limit' },
          { status: 400 }
        );
      }

      fileName = file.name.replace(/\.[^/.]+$/, '');
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { image, folder: customFolder } = body;
      if (customFolder) folder = customFolder;

      if (!image || typeof image !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Invalid or missing "image" field in request JSON' },
          { status: 400 }
        );
      }

      base64String = image;
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported Content-Type. Use multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    // Process upload to Cloudinary
    const payload = fileBuffer || base64String;
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Failed to process image payload' },
        { status: 400 }
      );
    }

    const uploadResult = await uploadToCloudinary(payload, {
      folder,
      tags: ['ecommerce', 'product-catalog'],
    });

    if (!uploadResult.success) {
      // If Cloudinary is not configured, provide a client-usable fallback if fileBuffer exists
      if (!isCloudinaryConfigured && fileBuffer) {
        const mimeType = contentType.includes('png') ? 'image/png' : 'image/jpeg';
        const fallbackDataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        return NextResponse.json({
          success: true,
          url: fallbackDataUrl,
          public_id: `local_preview_${Date.now()}`,
          isLocalPreview: true,
          message: 'Image loaded in preview mode (Cloudinary keys not yet set in environment)',
        });
      }

      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to upload image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      public_id: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      message: 'Image uploaded successfully to Cloudinary',
    });
  } catch (error: any) {
    console.error('Upload error in API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during upload' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    isCloudinaryConfigured,
    service: 'Cloudinary Media Service for EcomUnified',
  });
}
