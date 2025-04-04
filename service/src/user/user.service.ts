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
      where: [{ email: this.encryptionService.encrypt(email) }, { cpf: this.encryptionService.encrypt(cpf) }],
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
      email: this.encryptionService.encrypt(createUserDto.email),
      cpf: this.encryptionService.encrypt(createUserDto.cpf),
      birthDate: createUserDto.birthDate, // Não criptografar a data
      password: hashedPassword,
    };

    const user = this.userRepository.create(encryptedUser);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return this.decryptUsers(users);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    return this.decryptUser(user);
  }

  async findByEmail(email: string): Promise<User> {
    const encryptedEmail = this.encryptionService.encrypt(email);
    const user = await this.userRepository.findOne({
      where: { email: encryptedEmail },
      select: ['id', 'name', 'email', 'password', 'role', 'birthDate', 'cpf', 'photoUrl', 'isActive', 'createdAt', 'updatedAt', 'lastLogin'],
    });
    if (!user) return null;
    return this.decryptUser(user);
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se está tentando alterar um SUPER_USER
    if (user.role === UserRole.SUPER_USER) {
      throw new ForbiddenException('Super Usuários não podem ser alterados');
    }

    // Criptografar dados pessoais que estão sendo atualizados
    const encryptedUpdateData: any = {};
    
    if (updateUserDto.name) {
      encryptedUpdateData.name = this.encryptionService.encrypt(updateUserDto.name);
    }
    
    if (updateUserDto.email) {
      encryptedUpdateData.email = this.encryptionService.encrypt(updateUserDto.email);
    }
    
    if (updateUserDto.cpf) {
      encryptedUpdateData.cpf = this.encryptionService.encrypt(updateUserDto.cpf);
    }
    
    if (updateUserDto.birthDate) {
      encryptedUpdateData.birthDate = updateUserDto.birthDate; // Não criptografar a data
    }
    
    if (updateUserDto.password) {
      encryptedUpdateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Adicionar outros campos não criptografados
    if (updateUserDto.role) encryptedUpdateData.role = updateUserDto.role;
    if (updateUserDto.photoUrl) encryptedUpdateData.photoUrl = updateUserDto.photoUrl;
    if (updateUserDto.isActive !== undefined) encryptedUpdateData.isActive = updateUserDto.isActive;

    Object.assign(user, encryptedUpdateData);
    const updatedUser = await this.userRepository.save(user);
    return this.decryptUser(updatedUser);
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
    
    const decryptedUser = {
      ...user,
      name: this.encryptionService.decrypt(user.name),
      email: this.encryptionService.decrypt(user.email),
      cpf: this.encryptionService.decrypt(user.cpf),
      birthDate: user.birthDate, // Não descriptografar a data
    };
    
    return decryptedUser;
  }

  private decryptUsers(users: User[]): User[] {
    return users.map(user => this.decryptUser(user));
  }
}
