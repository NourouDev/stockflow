// src/modules/inventory/interfaces/product.interface.ts

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unitOfMeasure: string;
  unitPrice?: number;
  reorderPoint: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithStockSummary extends Product {
  totalOnHand: number;
  totalCommitted: number;
  totalAvailable: number;
  locationCount: number;
}