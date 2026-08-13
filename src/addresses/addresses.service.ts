import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto } from './dto/address.dto';
import { AddressResponse, transformAddress } from './transformers';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<AddressResponse[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map(transformAddress);
  }

  async create(userId: string, dto: AddressDto): Promise<AddressResponse> {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        label: dto.label,
        name: dto.name,
        phone: dto.phone ?? '',
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode ?? '',
        isDefault: dto.isDefault ?? false,
        userId,
      },
    });

    return transformAddress(address);
  }

  async findOne(id: string, userId: string): Promise<AddressResponse> {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return transformAddress(address);
  }

  async update(
    id: string,
    userId: string,
    dto: AddressDto,
  ): Promise<AddressResponse> {
    await this.findOne(id, userId);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.update({
      where: { id },
      data: {
        label: dto.label,
        name: dto.name,
        phone: dto.phone ?? '',
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode ?? '',
        isDefault: dto.isDefault ?? false,
      },
    });

    return transformAddress(address);
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    await this.findOne(id, userId);

    try {
      await this.prisma.address.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'No se puede eliminar una direccion con pedidos asociados',
        );
      }
      throw error;
    }

    return { success: true };
  }
}
