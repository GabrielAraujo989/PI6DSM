import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    name: string;
    birthDate: string;
    cpf: string;
    photoUrl?: string;
    role: UserRole;
    email: string;
    password: string;
    isActive?: boolean;
}
