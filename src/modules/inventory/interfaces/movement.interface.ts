// src/modules/inventory/interfaces/movement.interface.ts

export interface StockMovement {
  id: string;
  productId: string;
  fromLocationId?: string;
  fromLocationName?: string;
  toLocationId?: string;
  toLocationName?: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  referenceNumber?: string;
  reason?: string;
  unitCost?: number;
  performedById: string;
  performedByName?: string;
  createdAt: Date;
}

export interface MovementWithDetails extends StockMovement {
  productName?: string;
  productSku?: string;
  fromLocationName?: string;
  toLocationName?: string;
  performedByName?: string;
}

export interface MovementResult {
  movement: StockMovement;
  updatedStock: import('./stock.interface.js').Stock;
}