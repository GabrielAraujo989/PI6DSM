import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
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
      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        this.logger.warn(`Usuário não encontrado para o email: ${email}`);
        return null;
      }

      this.logger.log(`Usuário encontrado: ${JSON.stringify({ id: user.id, email: user.email, role: user.role })}`);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      this.logger.log(`Validação da senha: ${isPasswordValid}`);

      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }

      this.logger.warn('Senha inválida');
      return null;
    } catch (error) {
      this.logger.error(`Erro ao validar usuário: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(user: Omit<User, 'password'>) {
    try {
      this.logger.log(`Gerando token JWT para o usuário: ${user.email}`);
      const payload: JwtPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };
      const token = this.jwtService.sign(payload);
      this.logger.log('Token JWT gerado com sucesso');
      return {
        access_token: token,
      };
    } catch (error) {
      this.logger.error(`Erro ao gerar token JWT: ${error.message}`, error.stack);
      throw error;
    }
  }
} 