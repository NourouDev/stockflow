import { Injectable, Logger } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../../../shared/firebase/firebase.service';
import { IProductRepository, CreateProductDto, UpdateProductDto, QueryProductDto } from './product.repository.interface';
import { Product } from '../interfaces/product.interface';
import { PaginatedResult, CategoryCount } from '../../../shared/interfaces/index';
import { PaginationHelper } from '../../../shared/utils/pagination.helper';

const COLLECTION = 'products';

@Injectable()
export class FirestoreProductRepository implements IProductRepository {
  private readonly logger = new Logger(FirestoreProductRepository.name);

  constructor(
    private readonly firebase: FirebaseService,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const doc = await this.firebase.collectionRef(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return this.documentToProduct(doc.id, doc.data()!);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const snapshot = await this.firebase
      .collectionRef(COLLECTION)
      .where('sku', '==', sku)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.documentToProduct(doc.id, doc.data());
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    let ref: FirebaseFirestore.Query = this.firebase.collectionRef(COLLECTION);

    // Build filters
    const filters: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: unknown }> = [];

    if (query.search) {
      // Firestore doesn't support text search natively.
      // For simple prefix search, we can use >= and < range queries
      const searchLower = query.search.toLowerCase();
      const searchUpper = searchLower.replace(/.$/, (c) =>
        String.fromCharCode(c.charCodeAt(0) + 1),
      );
      // Apply to name field
      ref = ref.where('nameLower', '>=', searchLower).where('nameLower', '<', searchUpper);
    }

    if (query.category) {
      ref = ref.where('category', '==', query.category);
    }

    if (query.isActive !== undefined) {
      ref = ref.where('isActive', '==', query.isActive);
    }

    // Determine sort order
    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    ref = ref.orderBy(sortField, sortOrder);

    // Pagination
    const { offset, limit } = this.paginationHelper.getPaginationParams(query.page, query.limit);
    
    // For offset-based pagination, we need to get total count first
    const countSnapshot = await this.firebase.collectionRef(COLLECTION).count().get();
    const total = countSnapshot.data().count || 0;

    // Apply pagination
    const snapshot = await ref.limit(limit).offset(offset).get();

    const products = snapshot.docs.map((doc) =>
      this.documentToProduct(doc.id, doc.data()),
    );

    return this.paginationHelper.buildResult(products, total, query.page || 1, limit);
  }

  async create(data: CreateProductDto): Promise<Product> {
    const docRef = this.firebase.collectionRef(COLLECTION).doc();
    const now = Timestamp.now();

    const productData: Record<string, unknown> = {
      sku: data.sku,
      name: data.name,
      nameLower: data.name.toLowerCase(),
      description: data.description || null,
      category: data.category || null,
      unitOfMeasure: data.unitOfMeasure || 'pcs',
      unitPrice: data.unitPrice || null,
      reorderPoint: data.reorderPoint ?? 0,
      isActive: true,
      imageUrl: data.imageUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(productData);
    return this.documentToProduct(docRef.id, productData);
  }

  async update(id: string, data: Partial<UpdateProductDto>): Promise<Product> {
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.nameLower = data.name.toLowerCase();
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unitOfMeasure !== undefined) updateData.unitOfMeasure = data.unitOfMeasure;
    if (data.unitPrice !== undefined) updateData.unitPrice = data.unitPrice;
    if (data.reorderPoint !== undefined) updateData.reorderPoint = data.reorderPoint;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    await this.firebase.collectionRef(COLLECTION).doc(id).update(updateData);

    const updated = await this.findById(id);
    if (!updated) throw new Error('Product not found after update');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.firebase.collectionRef(COLLECTION).doc(id).update({
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  }

  async existsBySku(sku: string): Promise<boolean> {
    const snapshot = await this.firebase
      .collectionRef(COLLECTION)
      .where('sku', '==', sku)
      .limit(1)
      .get();
    return !snapshot.empty;
  }

  async countByCategory(): Promise<CategoryCount[]> {
    const snapshot = await this.firebase.collectionRef(COLLECTION).get();
    const categoryMap = new Map<string, number>();

    snapshot.docs.forEach((doc) => {
      const category = doc.data().category || 'uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  }

  private documentToProduct(id: string, data: Record<string, unknown>): Product {
    return {
      id,
      sku: data.sku as string,
      name: data.name as string,
      description: (data.description as string) || undefined,
      category: (data.category as string) || undefined,
      unitOfMeasure: (data.unitOfMeasure as string) || 'pcs',
      unitPrice: data.unitPrice != null ? Number(data.unitPrice) : undefined,
      reorderPoint: (data.reorderPoint as number) ?? 0,
      isActive: data.isActive !== false,
      imageUrl: (data.imageUrl as string) || undefined,
      createdAt: this.toDate(data.createdAt),
      updatedAt: this.toDate(data.updatedAt),
    };
  }

  private toDate(value: unknown): Date {
    if (value instanceof Timestamp) return value.toDate();
    if (value instanceof Date) return value;
    return new Date(value as string);
  }
}