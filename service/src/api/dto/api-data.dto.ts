import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class ApiDataDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, any>;
} 