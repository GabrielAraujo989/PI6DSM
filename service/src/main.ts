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
  const webAppUrl = configService.get<string>('WEB_APP_URL') || 'http://localhost:8082';

  // Configurações de segurança
  if (isProduction) {
    app.use(helmet());
    app.use(compression());
  }

  // Configuração simplificada de CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Permite solicitações sem origem (mobile, curl, etc)
      if (!origin) return callback(null, true);
      
      // Permite todas as origens em desenvolvimento
      if (!isProduction) return callback(null, true);

      // Lista de origens permitidas em produção
      const allowedOrigins = [
        webAppUrl,
        apiUrl,
        // Adicione outras origens de produção aqui
      ];

      // Verifica origem permitida
      if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
        return callback(null, true);
      }

      // Bloqueia origens não permitidas em produção
      logger.warn(`CORS bloqueado para origem: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  logger.log(`Allowed web origin: ${webAppUrl}`);
}
bootstrap();
