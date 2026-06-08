// src/modules/inventory/interfaces/stock.interface.ts

export interface Stock {
  id: string;
  productId: string;
  locationId: string;
  /** Denormalized location name for display. Updated when location name changes. */
  locationName?: string;
  quantityOnHand: number;
  quantityCommitted: number;
  quantityAvailable: number;
  lastCountedAt?: Date;
  lastCountedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockWithDetails extends Stock {
  productName?: string;
  productSku?: string;
  locationName?: string;
}

export interface StockSummary {
  productId: string;
  sku: string;
  name: string;
  totalOnHand: number;
  totalCommitted: number;
  totalAvailable: number;
  locations: { locationId: string; locationName: string; quantityOnHand: number }[];
}

export interface StockValuation {
  totalValue: number;
  totalProducts: number;
  totalQuantity: number;
  byLocation: {
    locationId: string;
    locationName: string;
    value: number;
    productCount: number;
  }[];
}