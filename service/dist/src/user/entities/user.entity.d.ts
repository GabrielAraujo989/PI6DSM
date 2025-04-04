export declare enum UserRole {
    SUPER_USER = "SUPER_USER",
    ADMIN = "ADMIN",
    CLIENT = "CLIENT"
}
export declare class User {
    id: string;
    name: string;
    birthDate: Date;
    cpf: string;
    photoUrl: string;
    role: UserRole;
    email: string;
    password: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin: Date;
}
