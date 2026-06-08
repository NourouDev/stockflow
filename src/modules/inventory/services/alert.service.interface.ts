import { StockAlert } from '../interfaces/alert.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';

export const ALERT_SERVICE = Symbol('ALERT_SERVICE');

export interface QueryAlertDto {
  page?: number;
  limit?: number;
  isResolved?: boolean;
  type?: 'low_stock' | 'out_of_stock' | 'overstock';
  startDate?: string;
  endDate?: string;
}

export interface IAlertService {
  findAll(query: QueryAlertDto): Promise<PaginatedResult<StockAlert>>;
  checkAndCreate(productId: string, locationId: string): Promise<StockAlert | null>;
  resolve(id: string, userId: string): Promise<StockAlert>;
  getUnresolvedCount(): Promise<number>;
}