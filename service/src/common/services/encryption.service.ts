import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService) {
    // Usar uma chave fixa de 32 bytes (256 bits) para AES-256
    const encryptionKey = 'PI6DSM_2024_KEY_32_BYTES_LONG';
    this.key = Buffer.from(encryptionKey);
    
    // Usar um IV fixo para garantir consistência
    this.iv = Buffer.from('PI6DSM_2024_IV_16');
  }

  encrypt(text: string): string {
    if (!text) return '';
    
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Erro ao criptografar:', error);
      throw new Error('Falha ao criptografar dados');
    }
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      throw new Error('Falha ao descriptografar dados');
    }
  }
} 