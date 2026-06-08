// Database-agnostic repository interface for User collection.
// No SQL or NoSQL assumptions — plain TypeScript types only.

import { User } from '../interfaces/user.interface';

export interface CreateUserDto {
  firebaseUid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role?: string;
  authProvider: 'google' | 'phone';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  isActive?: boolean;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  /** Find a user by their document ID. */
  findById(id: string): Promise<User | null>;

  /** Find a user by their Firebase Auth UID. */
  findByFirebaseUid(firebaseUid: string): Promise<User | null>;

  /** Find a user by email. */
  findByEmail(email: string): Promise<User | null>;

  /** Create a new user record. Returns the created user with generated ID. */
  create(data: CreateUserDto): Promise<User>;

  /** Update an existing user. Returns the updated user. */
  update(id: string, data: Partial<UpdateUserDto>): Promise<User>;

  /** Soft-delete by setting isActive = false. */
  softDelete(id: string): Promise<void>;

  /** Check if a Firebase UID already exists. */
  existsByFirebaseUid(firebaseUid: string): Promise<boolean>;
}