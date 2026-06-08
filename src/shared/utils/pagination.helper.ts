import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../interfaces/index';

@Injectable()
export class PaginationHelper {
  /**
   * Convert page/limit params to Firestore cursor-based pagination.
   * Returns offset for page-based calculation and limit.
   */
  getPaginationParams(page: number = 1, limit: number = 20): { offset: number; limit: number } {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    return {
      offset: (safePage - 1) * safeLimit,
      limit: safeLimit,
    };
  }

  /**
   * Build a PaginatedResult from an array of items and pagination info.
   * For Firestore, total may be estimated or require a separate count query.
   */
  buildResult<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> {
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}