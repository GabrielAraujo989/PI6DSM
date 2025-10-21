import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { EncryptionService } from '../common/services/encryption.service';
export declare class UserService {
    private userRepository;
    private encryptionService;
    constructor(userRepository: Repository<User>, encryptionService: EncryptionService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findAllClients(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User>;
    remove(id: string): Promise<void>;
    private decryptUser;
    private decryptUsers;
}
