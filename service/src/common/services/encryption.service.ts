import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService) {
    // Usar uma chave de 32 bytes (256 bits) para AES-256
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 
      'chave-de-criptografia-padrao-32-caracteres';
    
    // Criar um hash da chave para garantir que tenha o tamanho correto
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    // IV (Vetor de Inicialização) de 16 bytes (128 bits)
    this.iv = Buffer.alloc(16, 0);
  }

  encrypt(text: string): string {
    if (!text) return '';
    
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
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
      return '';
    }
  }
} 