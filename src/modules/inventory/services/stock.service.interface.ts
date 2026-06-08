import { Stock, StockWithDetails, StockSummary, StockValuation } from '../interfaces/stock.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';
import { QueryStockDto } from '../repositories/stock.repository.interface';

export const STOCK_SERVICE = Symbol('STOCK_SERVICE');

export interface StockAdjustmentDto {
  quantityOnHand: number;
  reason: string;
}

export interface IStockService {
  findAll(query: QueryStockDto): Promise<PaginatedResult<StockWithDetails>>;
  findByProductAndLocation(productId: string, locationId: string): Promise<StockWithDetails>;
  getStockSummary(productId: string): Promise<StockSummary>;
  getLowStockItems(): Promise<StockWithDetails[]>;
  adjustQuantity(productId: string, locationId: string, dto: StockAdjustmentDto): Promise<StockWithDetails>;
  getOrCreate(productId: string, locationId: string): Promise<Stock>;
  updateQuantity(productId: string, locationId: string, delta: number): Promise<Stock>;
  getTotalValue(locationId?: string, category?: string): Promise<StockValuation>;
}