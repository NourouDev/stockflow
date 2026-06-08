import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { REPORTING_SERVICE } from './reporting.service.interface';

@Module({
  providers: [
    { provide: REPORTING_SERVICE, useClass: ReportingService },
  ],
  exports: [REPORTING_SERVICE],
})
export class ReportingModule {}