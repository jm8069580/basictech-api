import {
  BadRequestException,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from './upload.service';

const MAX_SIZE = 5 * 1024 * 1024;
const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporciono ningun archivo');
    }

    if (!VALID_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no valido. Solo se permiten imagenes (JPG, PNG, WebP, GIF)',
      );
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        'El archivo es demasiado grande. Maximo 5MB',
      );
    }

    return this.uploadService.uploadImage(file.buffer);
  }

  @Roles('ADMIN')
  @Delete()
  remove(@Query('publicId') publicId?: string) {
    if (!publicId) {
      throw new BadRequestException('Se requiere el publicId');
    }

    return this.uploadService.deleteImage(publicId);
  }
}
