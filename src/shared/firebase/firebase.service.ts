import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  onModuleInit() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      this.logger.log('Firebase initialized with service account');
    } else {
      // Fall back to application default credentials (ADC)
      this.app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      this.logger.log('Firebase initialized with application default credentials');
    }
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return this.app.firestore();
  }

  /** Verify a Firebase ID token and return its decoded payload. */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(idToken);
  }

  /** Create a Firestore document reference (collection/document pattern). */
  docRef(collection: string, docId?: string): admin.firestore.DocumentReference {
    if (docId) {
      return this.firestore.collection(collection).doc(docId);
    }
    return this.firestore.collection(collection).doc();
  }

  /** Get a Firestore collection reference. */
  collectionRef(collection: string): admin.firestore.CollectionReference {
    return this.firestore.collection(collection);
  }

  /** Run a Firestore transaction. */
  async runTransaction<T>(
    updateFn: (transaction: admin.firestore.Transaction) => Promise<T>,
  ): Promise<T> {
    return this.firestore.runTransaction(updateFn);
  }

  /** Create a batch writer. */
  batch(): admin.firestore.WriteBatch {
    return this.firestore.batch();
  }

  /** Get a subcollection reference under a parent document. */
  subCollectionRef(
    parentCollection: string,
    parentId: string,
    subCollection: string,
  ): admin.firestore.CollectionReference {
    return this.firestore
      .collection(parentCollection)
      .doc(parentId)
      .collection(subCollection);
  }

  /** Get a collection group reference for cross-collection queries. */
  collectionGroupRef(collectionId: string): admin.firestore.CollectionGroup {
    return this.firestore.collectionGroup(collectionId);
  }
}