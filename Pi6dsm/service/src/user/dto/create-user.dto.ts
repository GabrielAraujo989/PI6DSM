import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, Length, Matches, IsDateString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  @Length(11, 11)
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas números' })
  cpf: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
