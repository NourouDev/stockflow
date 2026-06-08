// src/modules/inventory/interfaces/location.interface.ts

export interface StockLocation {
  id: string;
  name: string;
  code: string;
  type: 'warehouse' | 'store' | 'virtual';
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationWithStockSummary extends StockLocation {
  productCount: number;
  totalQuantity: number;
}