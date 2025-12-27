import client from '@shared/api/client';
import { extractLaptopPhotos, LaptopPhoto } from './photoNormalizer';
import { loadSession } from '@shared/utils';

export type LaptopStatus =
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'DRAFT'
  | 'DEACTIVATE'
  | 'DELETED'
  | 'PENDING'
  | 'SOLD'
  | string;

export type LaptopItem = {
  id: number;
  serialNumber?: string;
  dealer?: string;
  model?: string;
  brand?: string;
  price?: number;
  warrantyInYear?: number;
  processor?: string;
  processorBrand?: string;
  memoryType?: string;
  screenSize?: string;
  colour?: string;
  ram?: string;
  storage?: string;
  battery?: string;
  batteryLife?: string;
  graphicsCard?: string;
  graphicBrand?: string;
  weight?: string;
  manufacturer?: string;
  usbPorts?: number;
  status?: LaptopStatus;
  laptopPhotos?: LaptopPhoto[];
  deleted?: boolean;
  deletedAt?: string | null;
};

export type LaptopPageResponse = {
  content: LaptopItem[];
};


export async function getAllLaptops(): Promise<LaptopItem[]> {
  const session = await loadSession();

  const sellerId =
    session?.sellerId ??
    session?.user?.sellerId ??
    session?.user?.id;

  if (typeof sellerId !== 'number') {
    throw new Error('SellerId not found in session');
  }


  const res = await client.get<LaptopPageResponse>(
    `/api/laptops/getAllBySellerId?sellerId=${sellerId}`
  );

  const content = Array.isArray(res.data?.content)
    ? res.data.content
    : [];

  return content.map((item) => {
    const normalizedPhotos = extractLaptopPhotos(item);
    return {
      ...item,
      laptopPhotos:
        normalizedPhotos.length > 0
          ? normalizedPhotos
          : item.laptopPhotos ?? [],
    };
  });
}
