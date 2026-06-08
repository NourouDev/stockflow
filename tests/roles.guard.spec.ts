import { describe, it, expect, vi } from 'vitest';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';

describe('RolesGuard', () => {
  function createMockContext(userRole?: string, requiredRoles?: string[]) {
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);

    // Pre-set the metadata
    if (requiredRoles) {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    } else {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    }

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { role: userRole } : undefined,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    return { guard, mockContext };
  }

  it('should allow access when no roles are required', () => {
    const { guard, mockContext } = createMockContext('viewer');
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const { guard, mockContext } = createMockContext('admin', ['admin']);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access when user has one of the required roles', () => {
    const { guard, mockContext } = createMockContext('manager', ['admin', 'manager']);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const { guard, mockContext } = createMockContext('viewer', ['admin']);
    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should deny access when no user is present', () => {
    const { guard, mockContext } = createMockContext(undefined, ['admin']);
    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should deny access when user role is not in required roles', () => {
    const { guard, mockContext } = createMockContext('viewer', ['admin', 'manager']);
    expect(guard.canActivate(mockContext)).toBe(false);
  });
});