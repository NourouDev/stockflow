import { Injectable, Inject } from '@nestjs/common';
import { IAlertService, QueryAlertDto } from './alert.service.interface';
import { StockAlert } from '../interfaces/alert.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';
import { STOCK_REPOSITORY, IStockRepository } from '../repositories/stock.repository.interface';

@Injectable()
export class AlertService implements IAlertService {
  constructor(
    @Inject(STOCK_REPOSITORY) private readonly stockRepo: IStockRepository,
  ) {}

  async findAll(query: QueryAlertDto): Promise<PaginatedResult<StockAlert>> {
    throw new Error('Not implemented yet');
  }

  async checkAndCreate(productId: string, locationId: string): Promise<StockAlert | null> {
    throw new Error('Not implemented yet');
  }

  async resolve(id: string, userId: string): Promise<StockAlert> {
    throw new Error('Not implemented yet');
  }

  async getUnresolvedCount(): Promise<number> {
    return 0;
  }
}