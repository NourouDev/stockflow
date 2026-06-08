// src/modules/inventory/enums/movement-type.enum.ts

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
}

export enum LocationType {
  WAREHOUSE = 'warehouse',
  STORE = 'store',
  VIRTUAL = 'virtual',
}