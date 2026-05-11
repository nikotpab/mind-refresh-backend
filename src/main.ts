import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType, ClassSerializerInterceptor } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // JWT Secret validation
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    logger.error('CRITICAL: JWT_SECRET is not set or has less than 32 characters. Refusing to start.');
    process.exit(1);
  }
  
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());
  
  // CORS configuration validation
  let allowedOrigins: string[];
  const rawOrigins = process.env.ALLOWED_ORIGINS;
  if (process.env.NODE_ENV === 'production' && !rawOrigins) {
    logger.error('CRITICAL: ALLOWED_ORIGINS must be set in production. Refusing to start.');
    process.exit(1);
  }
  
  try {
    if (rawOrigins && rawOrigins.startsWith('[')) {
       allowedOrigins = JSON.parse(rawOrigins);
    } else {
       allowedOrigins = rawOrigins ? rawOrigins.split(',').map(o => o.trim()) : ['http://localhost:4200', 'http://localhost:80', 'http://localhost'];
    }
  } catch (e) {
    logger.error('CRITICAL: Failed to parse ALLOWED_ORIGINS. Refusing to start.', e);
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    logger.error('CRITICAL: ALLOWED_ORIGINS cannot be empty in production. Refusing to start.');
    process.exit(1);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Mind Refresh API')
    .setDescription('API documentation for Mind Refresh corporate wellness platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
