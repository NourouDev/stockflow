export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface TypeCount {
  type: string;
  count: number;
}

export interface PeriodCount {
  period: string;
  in: number;
  out: number;
  transfer: number;
  adjustment: number;
  total: number;
}

export interface LocationValue {
  locationId: string;
  locationName: string;
  value: number;
  productCount: number;
}

export interface LocationStockSummary {
  locationId: string;
  locationName: string;
  productCount: number;
  totalQuantity: number;
}

export interface Discrepancy {
  productId: string;
  productName: string;
  productSku: string;
  systemQty: number;
  countedQty: number;
  difference: number;
}

export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  totalLocations: number;
  totalStockMovements: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentMovements: unknown[];
  stockByLocation: LocationStockSummary[];
}

export interface MovementReport {
  totalMovements: number;
  movementsByType: Record<string, number>;
  movementsByPeriod: PeriodCount[];
}

export interface StockValuation {
  totalValue: number;
  totalProducts: number;
  totalQuantity: number;
  byLocation: LocationValue[];
}

export interface AccuracyReport {
  totalChecked: number;
  accurate: number;
  discrepant: number;
  accuracyRate: number;
  discrepancies: Discrepancy[];
}