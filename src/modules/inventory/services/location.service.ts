import { Injectable, Inject } from '@nestjs/common';
import { ILocationService } from './location.service.interface';
import { ILocationRepository, LOCATION_REPOSITORY, QueryLocationDto, CreateLocationDto, UpdateLocationDto } from '../repositories/location.repository.interface';
import { StockLocation, LocationWithStockSummary } from '../interfaces/location.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';

@Injectable()
export class LocationService implements ILocationService {
  constructor(
    @Inject(LOCATION_REPOSITORY) private readonly locationRepo: ILocationRepository,
  ) {}

  async findAll(query: QueryLocationDto): Promise<PaginatedResult<StockLocation>> {
    return this.locationRepo.findAll(query);
  }

  async findById(id: string): Promise<LocationWithStockSummary> {
    const location = await this.locationRepo.findById(id);
    if (!location) throw new Error('Location not found');
    return { ...location, productCount: 0, totalQuantity: 0 };
  }

  async create(dto: CreateLocationDto): Promise<StockLocation> {
    return this.locationRepo.create(dto);
  }

  async update(id: string, dto: UpdateLocationDto): Promise<StockLocation> {
    return this.locationRepo.update(id, dto);
  }

  async softDelete(id: string): Promise<void> {
    return this.locationRepo.softDelete(id);
  }
}