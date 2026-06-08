import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProductService } from '../src/modules/inventory/services/product.service';

describe('ProductService', () => {
  let productService: ProductService;
  let mockRepo: Record<string, ReturnType<typeof vi.fn>>;

  const mockProduct = {
    id: 'prod-123',
    sku: 'LAP-001',
    name: 'Laptop Pro 15"',
    description: 'High performance laptop',
    category: 'Electronics',
    unitOfMeasure: 'pcs',
    unitPrice: 1499.99,
    reorderPoint: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findBySku: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn(),
      existsBySku: vi.fn(),
      countByCategory: vi.fn(),
    };
    productService = new ProductService(mockRepo as any);
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const result = { data: [mockProduct], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      mockRepo.findAll.mockResolvedValue(result);

      const res = await productService.findAll({ page: 1, limit: 20 });
      expect(res).toEqual(result);
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('findById', () => {
    it('should return product with stock summary', async () => {
      mockRepo.findById.mockResolvedValue(mockProduct);

      const result = await productService.findById('prod-123');
      expect(result.id).toBe('prod-123');
      expect(result.sku).toBe('LAP-001');
      expect(result.totalOnHand).toBe(0);
      expect(result.locationCount).toBe(0);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(productService.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySku', () => {
    it('should return product when found by SKU', async () => {
      mockRepo.findBySku.mockResolvedValue(mockProduct);

      const result = await productService.findBySku('LAP-001');
      expect(result.id).toBe('prod-123');
    });

    it('should throw NotFoundException if sku not found', async () => {
      mockRepo.findBySku.mockResolvedValue(null);
      await expect(productService.findBySku('NONEXISTENT')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const dto = {
        sku: 'LAP-001',
        name: 'Laptop Pro 15"',
        unitOfMeasure: 'pcs',
        category: 'Electronics',
        unitPrice: 1499.99,
        reorderPoint: 5,
      };
      mockRepo.existsBySku.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(mockProduct);

      const result = await productService.create(dto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictException if SKU already exists', async () => {
      mockRepo.existsBySku.mockResolvedValue(true);

      await expect(
        productService.create({ sku: 'LAP-001', name: 'Test', unitOfMeasure: 'pcs' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update existing product', async () => {
      const updates = { name: 'Updated Laptop', unitPrice: 1299.99 };
      const updated = { ...mockProduct, ...updates };
      mockRepo.findById.mockResolvedValue(mockProduct);
      mockRepo.update.mockResolvedValue(updated);

      const result = await productService.update('prod-123', updates);
      expect(result.name).toBe('Updated Laptop');
      expect(result.unitPrice).toBe(1299.99);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(productService.update('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete existing product', async () => {
      mockRepo.findById.mockResolvedValue(mockProduct);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await productService.softDelete('prod-123');
      expect(mockRepo.softDelete).toHaveBeenCalledWith('prod-123');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(productService.softDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});