import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { LocationService } from './services/location.service';
import { MovementService } from './services/movement.service';
import { StockService } from './services/stock.service';
import { AlertService } from './services/alert.service';
import { PRODUCT_SERVICE } from './services/product.service.interface';
import { LOCATION_SERVICE } from './services/location.service.interface';
import { MOVEMENT_SERVICE } from './services/movement.service.interface';
import { STOCK_SERVICE } from './services/stock.service.interface';
import { ALERT_SERVICE } from './services/alert.service.interface';

@Module({
  controllers: [],  // Controllers will be added when implemented
  providers: [
    { provide: PRODUCT_SERVICE, useClass: ProductService },
    { provide: LOCATION_SERVICE, useClass: LocationService },
    { provide: MOVEMENT_SERVICE, useClass: MovementService },
    { provide: STOCK_SERVICE, useClass: StockService },
    { provide: ALERT_SERVICE, useClass: AlertService },
  ],
  exports: [PRODUCT_SERVICE, LOCATION_SERVICE, MOVEMENT_SERVICE, STOCK_SERVICE, ALERT_SERVICE],
})
export class InventoryModule {}