import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null>;
    login(user: Omit<User, 'password'>): Promise<{
        access_token: string;
    }>;
}
