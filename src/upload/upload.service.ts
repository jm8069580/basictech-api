import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { configureCloudinary } from './cloudinary';
import { StoreConfigService } from '../config/store-config.service';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class UploadService {
  constructor(
    config: ConfigService,
    private readonly storeConfig: StoreConfigService,
  ) {
    configureCloudinary(config);
  }

  async uploadImage(buffer: Buffer): Promise<UploadResult> {
    const settings = await this.storeConfig.getAll();

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: settings.cloudinaryFolder,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, res) => {
            if (error) reject(new Error(error.message ?? 'Upload failed'));
            else resolve(res as { secure_url: string; public_id: string });
          },
        )
        .end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async deleteImage(publicId: string): Promise<{ success: boolean }> {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  }
}
