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
  const apiUrl = configService.get<string>('API_URL') || 'http://localhost';
  const mobileAppUrl = configService.get<string>('MOBILE_APP_URL') || 'http://localhost';
  const webAppUrl = configService.get<string>('WEB_APP_URL') || 'http://localhost';

  // Configurações de segurança
  if (isProduction) {
    app.use(helmet());
    app.use(compression());
  }

  // Configuração de CORS para React Native (mobile e web)
  app.enableCors({
    origin: (origin, callback) => {
      // Permite solicitações sem origem (como apps mobile ou curl)
      if (!origin) return callback(null, true);
      
      // Lista de origens permitidas
      const allowedOrigins = [
        mobileAppUrl,
        webAppUrl,
        apiUrl,
        // Adicione outros domínios/URLs conforme necessário
      ];

      // Verifica se a origem está na lista de permitidas
      if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
        return callback(null, true);
      }

      // Rejeita outras origens em produção
      if (isProduction) {
        logger.warn(`CORS bloqueado para origem: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      }

      // Permite qualquer origem em desenvolvimento
      return callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: [
      'Content-Length',
      'Authorization',
      'Access-Control-Allow-Origin',
    ],
    maxAge: 86400, // 24 horas
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
  logger.log(`Application is running on: ${apiUrl}:${port}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV')}`);
  logger.log(`Allowed origins: ${mobileAppUrl}, ${webAppUrl}, ${apiUrl}`);
}
bootstrap();
