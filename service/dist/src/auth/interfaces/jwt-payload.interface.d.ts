import { UserRole } from '../../user/entities/user.entity';
export interface JwtPayload {
    email: string;
    sub: string;
    role: UserRole;
}
