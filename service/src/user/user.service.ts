import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private encryptionService: EncryptionService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, cpf, role } = createUserDto;

    // Verificar se já existe usuário com o mesmo email ou CPF
    const existingUser = await this.userRepository.findOne({
      where: [
        { email },
        { cpf: this.encryptionService.encrypt(cpf) }
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email ou CPF já cadastrado');
    }

    // Verificar se está tentando criar um SUPER_USER
    if (role === UserRole.SUPER_USER) {
      const superUserCount = await this.userRepository.count({
        where: { role: UserRole.SUPER_USER },
      });

      if (superUserCount >= 4) {
        throw new ForbiddenException('Número máximo de Super Usuários atingido');
      }
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criptografar dados pessoais
    const encryptedUser = {
      ...createUserDto,
      name: this.encryptionService.encrypt(createUserDto.name),
      email: createUserDto.email, // Não criptografar o email
      cpf: this.encryptionService.encrypt(createUserDto.cpf),
      birthDate: createUserDto.birthDate,
      password: hashedPassword,
    };

    const user = this.userRepository.create(encryptedUser);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email', 'role', 'birthDate', 'cpf', 'photoUrl', 'isActive', 'createdAt', 'updatedAt', 'lastLogin'],
    });
    return users.map(user => this.decryptUser(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'birthDate', 'cpf', 'photoUrl', 'isActive', 'createdAt', 'updatedAt', 'lastLogin'],
    });
    if (!user) return null;
    return this.decryptUser(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role', 'birthDate', 'cpf', 'photoUrl', 'isActive', 'createdAt', 'updatedAt', 'lastLogin'],
    });
    if (!user) return null;
    return this.decryptUser(user);
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }

    // Se estiver atualizando email ou CPF, verificar se já existe
    if (updateUserDto.email || updateUserDto.cpf) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: updateUserDto.email },
          { cpf: this.encryptionService.encrypt(updateUserDto.cpf) }
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email ou CPF já cadastrado');
      }
    }

    // Criptografar dados pessoais se fornecidos
    const encryptedData: Partial<User> = {};
    if (updateUserDto.name) {
      encryptedData.name = this.encryptionService.encrypt(updateUserDto.name);
    }
    if (updateUserDto.email) {
      encryptedData.email = updateUserDto.email; // Não criptografar o email
    }
    if (updateUserDto.cpf) {
      encryptedData.cpf = this.encryptionService.encrypt(updateUserDto.cpf);
    }
    if (updateUserDto.password) {
      encryptedData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Atualizar outros campos não criptografados
    Object.assign(encryptedData, {
      birthDate: updateUserDto.birthDate,
      photoUrl: updateUserDto.photoUrl,
      role: updateUserDto.role,
      isActive: updateUserDto.isActive,
    });

    await this.userRepository.update(id, encryptedData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se está tentando remover um SUPER_USER
    if (user.role === UserRole.SUPER_USER) {
      throw new ForbiddenException('Super Usuários não podem ser removidos');
    }

    await this.userRepository.remove(user);
  }

  // Métodos auxiliares para descriptografar dados
  private decryptUser(user: User): User {
    if (!user) return null;
    return {
      ...user,
      name: this.encryptionService.decrypt(user.name),
      email: user.email, // Não descriptografar o email
      cpf: this.encryptionService.decrypt(user.cpf),
    };
  }

  private decryptUsers(users: User[]): User[] {
    return users.map(user => this.decryptUser(user));
  }
}
