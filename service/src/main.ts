import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT') || 8082;
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Configurações de segurança
  if (isProduction) {
    app.use(helmet());
    app.use(compression());
  }

  // CORS
  app.enableCors({
    origin: [
    'https://pi-6dsm-pi-6dsm-service.26nnqp.easypanel.host',
    'exp://127.0.0.1:19000',
    'http://localhost:8081',
    'http://localhost:19006',
    '*'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Pipes globais
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: isProduction,
    }),
  );

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV')}`);
}
bootstrap();
