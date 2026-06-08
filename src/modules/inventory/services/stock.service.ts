import { Injectable, Inject } from '@nestjs/common';
import { IStockService, StockAdjustmentDto } from './stock.service.interface';
import { IStockRepository, STOCK_REPOSITORY, QueryStockDto } from '../repositories/stock.repository.interface';
import { Stock, StockWithDetails, StockSummary, StockValuation } from '../interfaces/stock.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';

@Injectable()
export class StockService implements IStockService {
  constructor(
    @Inject(STOCK_REPOSITORY) private readonly stockRepo: IStockRepository,
  ) {}

  async findAll(query: QueryStockDto): Promise<PaginatedResult<StockWithDetails>> {
    return this.stockRepo.findAll(query);
  }

  async findByProductAndLocation(productId: string, locationId: string): Promise<StockWithDetails> {
    const stock = await this.stockRepo.findByProductAndLocation(productId, locationId);
    if (!stock) throw new Error('Stock record not found');
    return stock;
  }

  async getStockSummary(productId: string): Promise<StockSummary> {
    return this.stockRepo.getProductSummary(productId);
  }

  async getLowStockItems(): Promise<StockWithDetails[]> {
    return this.stockRepo.findLowStock();
  }

  async adjustQuantity(productId: string, locationId: string, dto: StockAdjustmentDto): Promise<StockWithDetails> {
    await this.stockRepo.setExactQuantity(productId, locationId, dto.quantityOnHand);
    return this.findByProductAndLocation(productId, locationId);
  }

  async getOrCreate(productId: string, locationId: string): Promise<Stock> {
    let stock = await this.stockRepo.findByProductAndLocation(productId, locationId);
    if (!stock) {
      stock = await this.stockRepo.create({ productId, locationId });
    }
    return stock;
  }

  async updateQuantity(productId: string, locationId: string, delta: number): Promise<Stock> {
    return this.stockRepo.updateStockQuantity(productId, locationId, delta);
  }

  async getTotalValue(locationId?: string, category?: string): Promise<StockValuation> {
    return this.stockRepo.getTotalValue(locationId, category);
  }
}