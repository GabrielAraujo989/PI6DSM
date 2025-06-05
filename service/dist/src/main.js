"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const common_2 = require("@nestjs/common");
const helmet_1 = require("helmet");
const compression = require("compression");
async function bootstrap() {
    const logger = new common_2.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || configService.get('API_PORT') || 8082;
    const isProduction = configService.get('NODE_ENV') === 'production';
    if (isProduction) {
        app.use((0, helmet_1.default)());
        app.use(compression());
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: isProduction,
    }));
    app.enableCors({
        origin: '*',
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Environment: ${configService.get('NODE_ENV')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map