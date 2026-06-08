import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';
import { PaginationHelper } from './utils/pagination.helper';

@Global()
@Module({
  providers: [FirebaseService, PaginationHelper],
  exports: [FirebaseService, PaginationHelper],
})
export class SharedModule {}