import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { PdfModule } from 'src/pdf/pdf.module';

import { InvoiceModule } from 'src/invoice/invoice.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, PdfModule, InvoiceModule],
  controllers: [UploadController],
})
export class UploadModule {}
