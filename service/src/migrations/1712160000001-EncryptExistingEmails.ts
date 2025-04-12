import { MigrationInterface, QueryRunner } from 'typeorm';
import { EncryptionService } from '../common/services/encryption.service';
import { ConfigService } from '@nestjs/config';

export class EncryptExistingEmails1712160000001 implements MigrationInterface {
  private encryptionService: EncryptionService;

  constructor() {
    const configService = new ConfigService();
    this.encryptionService = new EncryptionService(configService);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buscar todos os usuários com email não criptografado
    const users = await queryRunner.query(`
      SELECT id, email
      FROM users
      WHERE email NOT LIKE '%:%'
    `);

    // Criptografar cada email
    for (const user of users) {
      const encryptedEmail = this.encryptionService.encrypt(user.email);
      await queryRunner.query(`
        UPDATE users
        SET email = $1
        WHERE id = $2
      `, [encryptedEmail, user.id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Buscar todos os usuários com email criptografado
    const users = await queryRunner.query(`
      SELECT id, email
      FROM users
      WHERE email LIKE '%:%'
    `);

    // Descriptografar cada email
    for (const user of users) {
      const decryptedEmail = this.encryptionService.decrypt(user.email);
      await queryRunner.query(`
        UPDATE users
        SET email = $1
        WHERE id = $2
      `, [decryptedEmail, user.id]);
    }
  }
} 