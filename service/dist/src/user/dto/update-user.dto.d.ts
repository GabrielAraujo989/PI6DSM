import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    name?: string;
    birthDate?: string;
    cpf?: string;
    photoUrl?: string;
    role?: UserRole;
    email?: string;
    password?: string;
    isActive?: boolean;
}
export {};
