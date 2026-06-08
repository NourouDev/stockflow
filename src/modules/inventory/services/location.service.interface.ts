import { StockLocation, LocationWithStockSummary } from '../interfaces/location.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';
import { QueryLocationDto, CreateLocationDto, UpdateLocationDto } from '../repositories/location.repository.interface';

export const LOCATION_SERVICE = Symbol('LOCATION_SERVICE');

export interface ILocationService {
  findAll(query: QueryLocationDto): Promise<PaginatedResult<StockLocation>>;
  findById(id: string): Promise<LocationWithStockSummary>;
  create(dto: CreateLocationDto): Promise<StockLocation>;
  update(id: string, dto: UpdateLocationDto): Promise<StockLocation>;
  softDelete(id: string): Promise<void>;
}