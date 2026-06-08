// src/modules/inventory/repositories/stock.repository.interface.ts
// Database-agnostic.

import { Stock, StockWithDetails, StockSummary, StockValuation } from '../interfaces/stock.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';

export interface CreateStockDto {
  productId: string;
  locationId: string;
  locationName?: string;
  quantityOnHand?: number;
  quantityCommitted?: number;
}

export interface QueryStockDto {
  page?: number;
  limit?: number;
  productId?: string;
  locationId?: string;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const STOCK_REPOSITORY = Symbol('STOCK_REPOSITORY');

export interface IStockRepository {
  findByProductAndLocation(productId: string, locationId: string): Promise<Stock | null>;
  findAll(query: QueryStockDto): Promise<PaginatedResult<StockWithDetails>>;
  create(data: CreateStockDto): Promise<Stock>;
  updateStockQuantity(productId: string, locationId: string, delta: number): Promise<Stock>;
  setExactQuantity(productId: string, locationId: string, quantityOnHand: number): Promise<Stock>;
  upsert(productId: string, locationId: string, data: Partial<CreateStockDto>): Promise<Stock>;
  findLowStock(): Promise<StockWithDetails[]>;
  getProductSummary(productId: string): Promise<StockSummary>;
  getTotalValue(locationId?: string, category?: string): Promise<StockValuation>;
}