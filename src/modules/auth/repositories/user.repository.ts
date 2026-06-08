import { Injectable, Logger } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '../../../shared/firebase/firebase.service';
import { IUserRepository, CreateUserDto, UpdateUserDto } from './user.repository.interface';
import { User } from '../interfaces/user.interface';

const COLLECTION = 'users';

@Injectable()
export class FirestoreUserRepository implements IUserRepository {
  private readonly logger = new Logger(FirestoreUserRepository.name);

  constructor(private readonly firebase: FirebaseService) {}

  async findById(id: string): Promise<User | null> {
    const doc = await this.firebase.collectionRef(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return this.documentToUser(doc.id, doc.data()!);
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const snapshot = await this.firebase
      .collectionRef(COLLECTION)
      .where('firebaseUid', '==', firebaseUid)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.documentToUser(doc.id, doc.data());
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const snapshot = await this.firebase
      .collectionRef(COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.documentToUser(doc.id, doc.data());
  }

  async create(data: CreateUserDto): Promise<User> {
    const docRef = this.firebase.collectionRef(COLLECTION).doc();
    const now = Timestamp.now();

    const userData: Record<string, unknown> = {
      firebaseUid: data.firebaseUid,
      email: data.email || null,
      phoneNumber: data.phoneNumber || null,
      displayName: data.displayName || null,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      photoURL: data.photoURL || null,
      role: data.role || 'viewer',
      isActive: true,
      authProvider: data.authProvider,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(userData);
    return this.documentToUser(docRef.id, { ...userData, id: docRef.id });
  }

  async update(id: string, data: Partial<UpdateUserDto>): Promise<User> {
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await this.firebase.collectionRef(COLLECTION).doc(id).update(updateData);

    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.firebase.collectionRef(COLLECTION).doc(id).update({
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  }

  async existsByFirebaseUid(firebaseUid: string): Promise<boolean> {
    const snapshot = await this.firebase
      .collectionRef(COLLECTION)
      .where('firebaseUid', '==', firebaseUid)
      .limit(1)
      .get();
    return !snapshot.empty;
  }

  private documentToUser(id: string, data: Record<string, unknown>): User {
    return {
      id,
      firebaseUid: data.firebaseUid as string,
      email: (data.email as string) || undefined,
      phoneNumber: (data.phoneNumber as string) || undefined,
      displayName: (data.displayName as string) || undefined,
      firstName: (data.firstName as string) || undefined,
      lastName: (data.lastName as string) || undefined,
      photoURL: (data.photoURL as string) || undefined,
      role: (data.role as User['role']) || 'viewer',
      isActive: data.isActive !== false,
      authProvider: data.authProvider as User['authProvider'],
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