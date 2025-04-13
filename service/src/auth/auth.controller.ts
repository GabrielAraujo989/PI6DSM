import { Controller, Post, Body, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      this.logger.log(`Recebida tentativa de login para o email: ${loginDto.email}`);
      
      if (!loginDto.email || !loginDto.password) {
        this.logger.warn('Email ou senha não fornecidos');
        throw new UnauthorizedException('Email e senha são obrigatórios');
      }

      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      return this.authService.login(user);
    } catch (error) {
      this.logger.error(`Erro no login: ${error.message}`, error.stack);
      throw error;
    }
  }
} 