// src/modules/inventory/repositories/product.repository.interface.ts
// Database-agnostic — works with Firestore, PostgreSQL, or any store.

import { Product } from '../interfaces/product.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';
import { CategoryCount } from '../../../shared/interfaces/index';

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unitOfMeasure: string;
  unitPrice?: number;
  reorderPoint?: number;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  category?: string;
  unitOfMeasure?: string;
  unitPrice?: number;
  reorderPoint?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface QueryProductDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(query: QueryProductDto): Promise<PaginatedResult<Product>>;
  create(data: CreateProductDto): Promise<Product>;
  update(id: string, data: Partial<UpdateProductDto>): Promise<Product>;
  softDelete(id: string): Promise<void>;
  existsBySku(sku: string): Promise<boolean>;
  countByCategory(): Promise<CategoryCount[]>;
}