import { StockMovement, MovementWithDetails, MovementResult } from '../interfaces/movement.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';
import { QueryMovementDto } from '../repositories/movement.repository.interface';

export const MOVEMENT_SERVICE = Symbol('MOVEMENT_SERVICE');

export interface CreateMovementInDto {
  productId: string;
  toLocationId: string;
  quantity: number;
  referenceNumber?: string;
  reason?: string;
  unitCost?: number;
}

export interface CreateMovementOutDto {
  productId: string;
  fromLocationId: string;
  quantity: number;
  referenceNumber?: string;
  reason?: string;
  unitCost?: number;
}

export interface CreateTransferDto {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  referenceNumber?: string;
  reason?: string;
}

export interface CreateAdjustmentDto {
  productId: string;
  locationId: string;
  quantityOnHand: number;
  reason: string;
}

export interface IMovementService {
  findAll(query: QueryMovementDto): Promise<PaginatedResult<MovementWithDetails>>;
  findById(id: string): Promise<MovementWithDetails>;
  recordIn(dto: CreateMovementInDto): Promise<MovementResult>;
  recordOut(dto: CreateMovementOutDto): Promise<MovementResult>;
  transfer(dto: CreateTransferDto): Promise<MovementResult>;
  adjust(dto: CreateAdjustmentDto): Promise<MovementResult>;
}