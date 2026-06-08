// src/modules/inventory/repositories/location.repository.interface.ts
// Database-agnostic.

import { StockLocation } from '../interfaces/location.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';

export interface CreateLocationDto {
  name: string;
  code: string;
  type?: string;
  address?: string;
}

export interface UpdateLocationDto {
  name?: string;
  code?: string;
  type?: string;
  address?: string;
  isActive?: boolean;
}

export interface QueryLocationDto {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
}

export const LOCATION_REPOSITORY = Symbol('LOCATION_REPOSITORY');

export interface ILocationRepository {
  findById(id: string): Promise<StockLocation | null>;
  findByCode(code: string): Promise<StockLocation | null>;
  findAll(query: QueryLocationDto): Promise<PaginatedResult<StockLocation>>;
  create(data: CreateLocationDto): Promise<StockLocation>;
  update(id: string, data: Partial<UpdateLocationDto>): Promise<StockLocation>;
  softDelete(id: string): Promise<void>;
  existsByCode(code: string): Promise<boolean>;
}