import { Injectable, UnauthorizedException, Logger, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    try {
      this.logger.log(`Tentando validar usuário com email: ${email}`);
      
      if (!email || !password) {
        throw new UnauthorizedException('Email e senha são obrigatórios');
      }

      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        this.logger.warn(`Usuário não encontrado para o email: ${email}`);
        throw new UnauthorizedException('Usuário não encontrado');
      }

      if (!user.isActive) {
        this.logger.warn(`Usuário inativo: ${email}`);
        throw new UnauthorizedException('Usuário inativo');
      }

      this.logger.log(`Usuário encontrado: ${JSON.stringify({ id: user.id, email: user.email, role: user.role })}`);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      this.logger.log(`Validação da senha: ${isPasswordValid}`);

      if (!isPasswordValid) {
        this.logger.warn('Senha inválida');
        throw new UnauthorizedException('Senha inválida');
      }

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Erro ao validar usuário: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao processar login');
    }
  }

  async login(user: Omit<User, 'password'>) {
    try {
      if (!user || !user.email || !user.id) {
        throw new InternalServerErrorException('Dados do usuário inválidos');
      }

      this.logger.log(`Gerando token JWT para o usuário: ${user.email}`);
      const payload: JwtPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };

      if (!this.jwtService) {
        throw new InternalServerErrorException('Serviço JWT não inicializado');
      }

      const token = this.jwtService.sign(payload);
      this.logger.log('Token JWT gerado com sucesso');
      return {
        access_token: token,
      };
    } catch (error) {
      this.logger.error(`Erro ao gerar token JWT: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao gerar token de acesso');
    }
  }
} 