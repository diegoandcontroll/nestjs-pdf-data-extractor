import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PdfModule } from './pdf/pdf.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PrismaModule,
    PdfModule,
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    InvoiceModule,
  ],
})
export class AppModule {}
