import type { Address } from '@prisma/client';

export interface AddressResponse {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export function transformAddress(address: Address): AddressResponse {
  return {
    id: address.id,
    label: address.label,
    name: address.name,
    phone: address.phone ?? '',
    address: address.address,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode ?? '',
    isDefault: address.isDefault,
  };
}
