import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security by Design: Protección de cabeceras HTTP
  app.use(helmet());
  
  // CORS Configuration para Zero Trust
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  // OWASP A10:2025 - Global Exception Handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  // API Versioning
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
