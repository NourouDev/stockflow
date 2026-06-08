import { PaginatedResult, DashboardSummary, MovementReport, StockValuation, AccuracyReport } from '../../shared/interfaces/index';
import { StockAlert } from '../inventory/interfaces/alert.interface';

export const REPORTING_SERVICE = Symbol('REPORTING_SERVICE');

export interface MovementReportParams {
  startDate: string;
  endDate: string;
  productId?: string;
  locationId?: string;
  type?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface ValuationParams {
  locationId?: string;
  category?: string;
}

export interface AccuracyParams {
  locationId?: string;
  date?: string;
}

export interface AlertReportParams {
  page?: number;
  limit?: number;
  isResolved?: boolean;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface IReportingService {
  getDashboardSummary(): Promise<DashboardSummary>;
  getMovementReport(params: MovementReportParams): Promise<MovementReport>;
  getStockValuation(params: ValuationParams): Promise<StockValuation>;
  getInventoryAccuracy(params: AccuracyParams): Promise<AccuracyReport>;
  getAlertReport(params: AlertReportParams): Promise<PaginatedResult<StockAlert>>;
}