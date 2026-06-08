import { describe, it, expect } from 'vitest';
import { PaginationHelper } from '../src/shared/utils/pagination.helper';

describe('PaginationHelper', () => {
  const helper = new PaginationHelper();

  it('should return default pagination params', () => {
    const params = helper.getPaginationParams();
    expect(params.offset).toBe(0);
    expect(params.limit).toBe(20);
  });

  it('should calculate offset correctly for page 2', () => {
    const params = helper.getPaginationParams(2, 20);
    expect(params.offset).toBe(20);
    expect(params.limit).toBe(20);
  });

  it('should cap limit at 100', () => {
    const params = helper.getPaginationParams(1, 500);
    expect(params.limit).toBe(100);
  });

  it('should build a paginated result', () => {
    const items = [{ id: '1' }, { id: '2' }];
    const result = helper.buildResult(items, 10, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(10);
    expect(result.meta.page).toBe(1);
    expect(result.meta.totalPages).toBe(5);
  });
});