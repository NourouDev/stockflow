import { Injectable, Inject } from '@nestjs/common';
import { IProductService } from './product.service.interface';
import { IProductRepository, PRODUCT_REPOSITORY, QueryProductDto, CreateProductDto, UpdateProductDto } from '../repositories/product.repository.interface';
import { Product, ProductWithStockSummary } from '../interfaces/product.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: IProductRepository,
  ) {}

  async findAll(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    return this.productRepo.findAll(query);
  }

  async findById(id: string): Promise<ProductWithStockSummary> {
    const product = await this.productRepo.findById(id);
    if (!product) throw new Error('Product not found');
    return { ...product, totalOnHand: 0, totalCommitted: 0, totalAvailable: 0, locationCount: 0 };
  }

  async findBySku(sku: string): Promise<ProductWithStockSummary> {
    const product = await this.productRepo.findBySku(sku);
    if (!product) throw new Error('Product not found');
    return { ...product, totalOnHand: 0, totalCommitted: 0, totalAvailable: 0, locationCount: 0 };
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return this.productRepo.create(dto);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    return this.productRepo.update(id, dto);
  }

  async softDelete(id: string): Promise<void> {
    return this.productRepo.softDelete(id);
  }
}