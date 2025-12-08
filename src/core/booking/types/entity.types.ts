export type EntityType = 'mobile'|'laptop'; // Future: Add | 'car' | 'laptop' | 'bike'

export interface BookableEntity {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
  status: 'ACTIVE' | 'SOLD' | 'DRAFT' | 'DELETED';
  sellerId: number;
}

// ========================================
// MOBILE BOOKING BLOCK
// ========================================
export interface MobileEntity extends BookableEntity {
  mobileId: number;
  brand: string;
  model: string;
  condition: string;
  year: number;
  color: string;
  description: string;
  isNegotiable: boolean;
  images: string[];
  userId: number;
}
// ========================================
// LAPTOP BOOKING BLOCK
// ========================================
export interface LaptopEntity extends BookableEntity {
  laptopId: number;
  brand: string;
  model: string;
  processor: string;
  processorBrand: string;
  memoryType: string;
  screenSize: string;
  colour: string;
  ram: string;
  storage: string;
  battery: string;
  batteryLife: string;
  graphicsCard: string;
  graphicBrand: string;
  weight: string;
  manufacturer: string;
  usbPorts: string;
  warrantyInYear: number;
  description: string;
  isNegotiable: boolean;
  laptopPhotos: { photo_link: string }[];  // Image array
  userId: number;
}


// Future: Add car, bike, laptop entity interfaces here
