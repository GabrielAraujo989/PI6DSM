import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    register(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    findAll(req: Request): any[] | Promise<import("./entities/user.entity").User[]>;
    getProfile(req: Request): Promise<import("./entities/user.entity").User>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<import("./entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
