import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { PRODUCT_SERVICE, IProductService } from '../services/product.service.interface';
import { Product, ProductWithStockSummary } from '../interfaces/product.interface';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';
import { PaginatedResult } from '../../../shared/interfaces/index';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productService: IProductService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryProductDto): Promise<PaginatedResult<Product>> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductWithStockSummary> {
    return this.productService.findById(id);
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string): Promise<ProductWithStockSummary> {
    return this.productService.findBySku(sku);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.productService.softDelete(id);
  }
}