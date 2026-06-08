// src/modules/inventory/interfaces/alert.interface.ts

export interface StockAlert {
  id: string;
  productId: string;
  productName?: string;
  productSku?: string;
  locationId: string;
  locationName?: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  message: string;
  thresholdValue: number;
  currentValue: number;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedById?: string;
  resolvedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}