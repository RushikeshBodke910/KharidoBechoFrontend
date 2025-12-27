// src/form/schemas/laptopDetailsSchema.ts
import { z } from 'zod';

/* ---------- Common ---------- */

// Required string (globally)
const requiredString = (max = 50) =>
  z
    .string({
      required_error: 'This field is required',
      invalid_type_error: 'This field is required',
    })
    .trim()
    .min(1, 'This field is required')
    .max(max, 'Value is too long');

// Numeric string
const numericStringToNumber = z
  .string()
  .min(1, 'This field is required')
  .refine((val) => !isNaN(Number(val)), 'Must be a numeric value')
  .transform((val) => Number(val));

/* ---------- Schema ---------- */

export const laptopDetailsSchema = z.object({
  serialNumber: requiredString(30).regex(
    /^[A-Za-z0-9\-]+$/,
    'Serial number must contain only letters, numbers, or hyphens',
  ),

  dealer: requiredString(50).regex(
    /^\s*(?=.*\p{L})[\p{L}\s\-\.]+\s*$/u,
    'Dealer must contain letters only',
  ),

  brand: requiredString(50).regex(
    /^[A-Za-z\s\-\.]+$/,
    'Brand must contain letters only',
  ),

  model: requiredString(50).regex(
    /^(?=.*[A-Za-z])[A-Za-z0-9\s\-\.]+$/,
    'Invalid model format',
  ),

  price: numericStringToNumber.refine(
    (val) => val > 0,
    'Price must be greater than zero',
  ),

  warrantyInYear: z
    .number({
      required_error: 'Warranty is required',
    })
    .int()
    .min(0)
    .max(10),

  processor: requiredString(50).regex(
    /^(?=.*[A-Za-z])[A-Za-z0-9\s\-\.]+$/,
    'Invalid processor',
  ),

  processorBrand: requiredString(50).regex(
    /^[A-Za-z\s\-\.]+$/,
    'Invalid processor brand',
  ),

  memoryType: requiredString(50),

  ram: requiredString(30),

  storage: requiredString(30),

  colour: requiredString(50),

  screenSize: requiredString(20),

  battery: requiredString(100),

  batteryLife: requiredString(50),

  graphicsCard: requiredString(30),

  graphicBrand: requiredString(50),

  weight: z
    .string()
    .trim()
    .regex(
      /^(?!0+(\.0+)?$)([1-9]\d*(\.\d+)?|0?\.\d*[1-9]\d*)\s?kg$/,
      'Weight must be greater than zero and end with kg',
    ),

  manufacturer: requiredString(50),

  /*  USB Ports  */
  usbPorts: z
    .string({
      required_error: 'USB ports is required',
    })
    .min(1, 'USB ports is required')
    .refine((val) => /^\d+$/.test(val.trim()), 'USB ports must be numeric')
    .transform((val) => Number(val))
    .refine(
      (val) => val >= 1 && val <= 6,
      'USB ports must be between 1 and 6',
    ),
});



export type LaptopDetailsFormValues = z.infer<typeof laptopDetailsSchema>;

/* ---------- Default Values ---------- */

export const getDefaultLaptopDetailsValues =
  (): LaptopDetailsFormValues => ({
    serialNumber: 'SNX12345AB67',
    dealer: 'Tech World Computers',
    brand: 'HP',
    model: 'Pavilion 15-eg2005TU',
    price: '62999',
    warrantyInYear: 1,
    processor: 'Intel Core i5-1240P',
    processorBrand: 'Intel',
    ram: '16GB DDR4',
    storage: '512GB SSD',
    colour: 'Silver',
    screenSize: '15.6 inch',
    memoryType: 'SSD',
    battery: '3-cell 41Wh Li-ion',
    batteryLife: 'Up to 8 hours',
    graphicsCard: 'Intel Iris Xe',
    graphicBrand: 'Intel',
    weight: '1.75 kg',
    manufacturer: 'HP Inc.',
    usbPorts: '1',
  });
