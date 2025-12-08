import apiClient from '@shared/api/client';
import { EntityConfig, BaseEntity, PageResponse } from '../config/entityTypes';

export interface GetAllParams {
  page?: number;
  size?: number;
  sort?: string;
}

export async function getAllEntities<T extends BaseEntity>(
  config: EntityConfig<T>,
  params?: GetAllParams
): Promise<PageResponse<T>> {
  const { page = 0, size = 20, sort = 'createdAt,DESC' } = params || {};

  const response = await apiClient.get(config.api.getAll, {
    params: { page, size, sort },
  });

  const data = response.data;

  // CASE 1: If Laptop API returns a simple array
  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: 0,
      size: data.length,
      first: true,
      last: true,
      empty: data.length === 0,
    };
  }

  // CASE 2: Mobile/Car pageable response
  return data;
}

export async function getEntityById<T extends BaseEntity>(
  config: EntityConfig<T>,
  id: number
): Promise<T> {
  const response = await apiClient.get<T>(config.api.getById(id));
  return response.data;
}

export function getEntityId<T extends BaseEntity>(
  entity: T,
  config: EntityConfig<T>
): number {
  return entity[config.idField] as number;
}

export function getEntityTitle<T extends BaseEntity>(
  entity: T,
  config: EntityConfig<T>
): string {
  return entity[config.titleField] as string;
}

export function getEntityPrice<T extends BaseEntity>(
  entity: T,
  config: EntityConfig<T>
): number {
  return entity[config.priceField] as number;
}

export function getEntityImages<T extends BaseEntity>(
  entity: T,
  config: EntityConfig<T>
): Array<{ imageId: number; imageUrl: string }> {

  const images = (entity as any)[config.imagesField];

  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }

  return images.map((img: any, index: number) => ({
    imageId: img.imageId ?? index,
    imageUrl:
      img.imageUrl ??
      img.photo_link ??
      img.photoUrl ??
      img.url ??
      null,
  }))
  .filter(i => i.imageUrl); // remove invalid entries
}



export function getEntityDescription<T extends BaseEntity>(
  entity: T,
  config: EntityConfig<T>
): string {
  return (entity[config.descriptionField] as string) || '';
}
