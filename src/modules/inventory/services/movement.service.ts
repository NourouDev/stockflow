import { Injectable, Inject } from '@nestjs/common';
import { IMovementService, CreateMovementInDto, CreateMovementOutDto, CreateTransferDto, CreateAdjustmentDto } from './movement.service.interface';
import { IMovementRepository, MOVEMENT_REPOSITORY, QueryMovementDto, CreateMovementRecordDto } from '../repositories/movement.repository.interface';
import { IStockRepository, STOCK_REPOSITORY } from '../repositories/stock.repository.interface';
import { IAlertService, ALERT_SERVICE } from './alert.service.interface';
import { StockMovement, MovementWithDetails, MovementResult } from '../interfaces/movement.interface';
import { PaginatedResult } from '../../../shared/interfaces/index';

@Injectable()
export class MovementService implements IMovementService {
  constructor(
    @Inject(MOVEMENT_REPOSITORY) private readonly movementRepo: IMovementRepository,
    @Inject(STOCK_REPOSITORY) private readonly stockRepo: IStockRepository,
    @Inject(ALERT_SERVICE) private readonly alertService: IAlertService,
  ) {}

  async findAll(query: QueryMovementDto): Promise<PaginatedResult<MovementWithDetails>> {
    return this.movementRepo.findAll(query);
  }

  async findById(id: string): Promise<MovementWithDetails> {
    const movement = await this.movementRepo.findById(id);
    if (!movement) throw new Error('Movement not found');
    return movement;
  }

  async recordIn(dto: CreateMovementInDto): Promise<MovementResult> {
    // Validate
    const movementRecord: CreateMovementRecordDto = {
      productId: dto.productId,
      toLocationId: dto.toLocationId,
      type: 'in',
      quantity: dto.quantity,
      referenceNumber: dto.referenceNumber,
      reason: dto.reason,
      unitCost: dto.unitCost,
      performedById: '',  // Set by controller from auth context
    };

    const movement = await this.movementRepo.create(movementRecord);
    const updatedStock = await this.stockRepo.updateStockQuantity(
      dto.productId, dto.toLocationId, dto.quantity,
    );

    // Check for alerts
    await this.alertService.checkAndCreate(dto.productId, dto.toLocationId);

    return { movement, updatedStock };
  }

  async recordOut(dto: CreateMovementOutDto): Promise<MovementResult> {
    // Check sufficient stock
    const stock = await this.stockRepo.findByProductAndLocation(dto.productId, dto.fromLocationId);
    if (!stock || stock.quantityAvailable < dto.quantity) {
      throw new Error('Insufficient stock');
    }

    const movementRecord: CreateMovementRecordDto = {
      productId: dto.productId,
      fromLocationId: dto.fromLocationId,
      type: 'out',
      quantity: dto.quantity,
      referenceNumber: dto.referenceNumber,
      reason: dto.reason,
      unitCost: dto.unitCost,
      performedById: '',  // Set by controller
    };

    const movement = await this.movementRepo.create(movementRecord);
    const updatedStock = await this.stockRepo.updateStockQuantity(
      dto.productId, dto.fromLocationId, -dto.quantity,
    );

    // Check for alerts
    await this.alertService.checkAndCreate(dto.productId, dto.fromLocationId);

    return { movement, updatedStock };
  }

  async transfer(dto: CreateTransferDto): Promise<MovementResult> {
    // Check source stock
    const sourceStock = await this.stockRepo.findByProductAndLocation(dto.productId, dto.fromLocationId);
    if (!sourceStock || sourceStock.quantityAvailable < dto.quantity) {
      throw new Error('Insufficient stock');
    }

    const movementRecord: CreateMovementRecordDto = {
      productId: dto.productId,
      fromLocationId: dto.fromLocationId,
      toLocationId: dto.toLocationId,
      type: 'transfer',
      quantity: dto.quantity,
      referenceNumber: dto.referenceNumber,
      reason: dto.reason,
      performedById: '',  // Set by controller
    };

    const movement = await this.movementRepo.create(movementRecord);
    // Decrement source
    await this.stockRepo.updateStockQuantity(dto.productId, dto.fromLocationId, -dto.quantity);
    // Increment destination
    const updatedStock = await this.stockRepo.updateStockQuantity(dto.productId, dto.toLocationId, dto.quantity);

    // Check alerts for both locations
    await this.alertService.checkAndCreate(dto.productId, dto.fromLocationId);
    await this.alertService.checkAndCreate(dto.productId, dto.toLocationId);

    return { movement, updatedStock };
  }

  async adjust(dto: CreateAdjustmentDto): Promise<MovementResult> {
    const current = await this.stockRepo.findByProductAndLocation(dto.productId, dto.locationId);
    const currentQty = current?.quantityOnHand ?? 0;
    const difference = dto.quantityOnHand - currentQty;

    const movementRecord: CreateMovementRecordDto = {
      productId: dto.productId,
      toLocationId: dto.locationId,
      type: 'adjustment',
      quantity: Math.abs(difference),
      reason: dto.reason,
      performedById: '',  // Set by controller
    };

    const movement = await this.movementRepo.create(movementRecord);
    const updatedStock = await this.stockRepo.setExactQuantity(
      dto.productId, dto.locationId, dto.quantityOnHand,
    );

    // Check for alerts
    await this.alertService.checkAndCreate(dto.productId, dto.locationId);
    
    return { movement, updatedStock };
  }
}