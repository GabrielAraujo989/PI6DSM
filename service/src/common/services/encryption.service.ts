import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly salt: string;

  constructor(private configService: ConfigService) {
    // Usar uma chave de 32 bytes (256 bits) para AES-256
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 
      'chave-de-criptografia-padrao-32-caracteres';
    
    this.salt = this.configService.get<string>('ENCRYPTION_SALT') || 'salt';
    
    // Criar um hash da chave para garantir que tenha o tamanho correto
    this.key = crypto.scryptSync(encryptionKey, this.salt, 32);
  }

  encrypt(text: string): string {
    if (!text) return '';
    
    try {
      // Gerar um IV aleatório para cada operação
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Concatenar o IV com o texto criptografado
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Erro ao criptografar:', error);
      throw new Error('Falha ao criptografar dados');
    }
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    
    try {
      // Separar o IV do texto criptografado
      const [ivHex, encrypted] = encryptedText.split(':');
      if (!ivHex || !encrypted) {
        throw new Error('Formato de texto criptografado inválido');
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      throw new Error('Falha ao descriptografar dados');
    }
  }
} 