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
  // Usa PORT da env, senão API_PORT, senão 8082
  const port = configService.get<number>('PORT') || configService.get<number>('API_PORT') || 8082;
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Configurações de segurança
  if (isProduction) {
    app.use(helmet());
    app.use(compression());
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: isProduction,
    }),
  );

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV')}`);
}
bootstrap();
