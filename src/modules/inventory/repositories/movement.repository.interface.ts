// src/modules/inventory/repositories/movement.repository.interface.ts
// Database-agnostic.

import { StockMovement } from '../interfaces/movement.interface';
import { PaginatedResult, TypeCount, PeriodCount } from '../../../shared/interfaces/index';

export interface CreateMovementRecordDto {
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
}

export interface QueryMovementDto {
  page?: number;
  limit?: number;
  productId?: string;
  type?: string;
  fromLocationId?: string;
  toLocationId?: string;
  performedById?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const MOVEMENT_REPOSITORY = Symbol('MOVEMENT_REPOSITORY');

export interface IMovementRepository {
  findById(id: string): Promise<StockMovement | null>;
  findAll(query: QueryMovementDto): Promise<PaginatedResult<StockMovement>>;
  create(data: CreateMovementRecordDto): Promise<StockMovement>;
  countByType(startDate?: Date, endDate?: Date): Promise<TypeCount[]>;
  countByPeriod(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month'): Promise<PeriodCount[]>;
}