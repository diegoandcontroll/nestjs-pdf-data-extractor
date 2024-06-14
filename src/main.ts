import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RolesGuard } from './auth/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ methods: '*', origin: '*' });
  const config = new DocumentBuilder()
    .setTitle('Ecommerce API Documentation')
    .setDescription('The Ecommerce API description')
    .setVersion('1.0')
    .addTag('Ecommerce')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.setGlobalPrefix('api/v1');
  // SwaggerModule setup (see https://docs.nestjs.com/recipes/swagger)
  SwaggerModule.setup('api', app, document);

  // Global Guards (see https://docs.nestjs.com/guards#global-guards)
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));
  await app.listen(process.env.PORT || 8081);
}
bootstrap();
