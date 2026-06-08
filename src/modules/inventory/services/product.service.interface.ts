import { Product, ProductWithStockSummary } from '../interfaces/product.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';
import { QueryProductDto, CreateProductDto, UpdateProductDto } from '../repositories/product.repository.interface';

export const PRODUCT_SERVICE = Symbol('PRODUCT_SERVICE');

export interface IProductService {
  findAll(query: QueryProductDto): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<ProductWithStockSummary>;
  findBySku(sku: string): Promise<ProductWithStockSummary>;
  create(dto: CreateProductDto): Promise<Product>;
  update(id: string, dto: UpdateProductDto): Promise<Product>;
  softDelete(id: string): Promise<void>;
}