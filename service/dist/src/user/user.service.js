"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_entity_2 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
const encryption_service_1 = require("../common/services/encryption.service");
let UserService = class UserService {
    constructor(userRepository, encryptionService) {
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
    }
    async create(createUserDto) {
        const { email, cpf, role } = createUserDto;
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { cpf: this.encryptionService.encrypt(cpf) }],
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email ou CPF já cadastrado');
        }
        if (role === user_entity_2.UserRole.SUPER_USER) {
            const superUserCount = await this.userRepository.count({
                where: { role: user_entity_2.UserRole.SUPER_USER },
            });
            if (superUserCount >= 4) {
                throw new common_1.ForbiddenException('Número máximo de Super Usuários atingido');
            }
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const encryptedUser = {
            ...createUserDto,
            name: this.encryptionService.encrypt(createUserDto.name),
            email: createUserDto.email,
            cpf: this.encryptionService.encrypt(createUserDto.cpf),
            birthDate: createUserDto.birthDate,
            password: hashedPassword,
        };
        const user = this.userRepository.create(encryptedUser);
        return this.userRepository.save(user);
    }
    async findAll() {
        const users = await this.userRepository.find({
            select: ['id', 'name', 'email', 'role', 'birthDate', 'cpf', 'photoUrl', 'isActive', 'createdAt', 'updatedAt', 'lastLogin'],
        });
        return users.map(user => this.decryptUser(user));
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'role', 'birthDate', 'cpf', 'photoUrl', 'isActive', 'createdAt', 'updatedAt', 'lastLogin'],
        });
        if (!user)
            return null;
        return this.decryptUser(user);
    }
    async findByEmail(email) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'role', 'birthDate', 'cpf', 'photoUrl', 'isActive', 'createdAt', 'updatedAt', 'lastLogin'],
        });
        if (!user)
            return null;
        return this.decryptUser(user);
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (!user) {
            return null;
        }
        if (updateUserDto.email || updateUserDto.cpf) {
            const existingUser = await this.userRepository.findOne({
                where: [
                    { email: updateUserDto.email },
                    { cpf: this.encryptionService.encrypt(updateUserDto.cpf) }
                ],
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('Email ou CPF já cadastrado');
            }
        }
        const encryptedData = {};
        if (updateUserDto.name) {
            encryptedData.name = this.encryptionService.encrypt(updateUserDto.name);
        }
        if (updateUserDto.email) {
            encryptedData.email = updateUserDto.email;
        }
        if (updateUserDto.cpf) {
            encryptedData.cpf = this.encryptionService.encrypt(updateUserDto.cpf);
        }
        if (updateUserDto.password) {
            encryptedData.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        Object.assign(encryptedData, {
            birthDate: updateUserDto.birthDate,
            photoUrl: updateUserDto.photoUrl,
            role: updateUserDto.role,
            isActive: updateUserDto.isActive,
        });
        await this.userRepository.update(id, encryptedData);
        return this.findOne(id);
    }
    async remove(id) {
        const user = await this.findOne(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        if (user.role === user_entity_2.UserRole.SUPER_USER) {
            throw new common_1.ForbiddenException('Super Usuários não podem ser removidos');
        }
        await this.userRepository.remove(user);
    }
    decryptUser(user) {
        if (!user)
            return null;
        return {
            ...user,
            name: this.encryptionService.decrypt(user.name),
            email: user.email,
            cpf: this.encryptionService.decrypt(user.cpf),
        };
    }
    decryptUsers(users) {
        return users.map(user => this.decryptUser(user));
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        encryption_service_1.EncryptionService])
], UserService);
//# sourceMappingURL=user.service.js.map