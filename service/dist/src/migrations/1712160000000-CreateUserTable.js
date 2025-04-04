"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1712160000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUserTable1712160000000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '100',
                },
                {
                    name: 'birthDate',
                    type: 'date',
                },
                {
                    name: 'cpf',
                    type: 'varchar',
                    length: '11',
                    isUnique: true,
                },
                {
                    name: 'photoUrl',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: ['SUPER_USER', 'ADMIN', 'CLIENT'],
                    default: "'CLIENT'",
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '100',
                    isUnique: true,
                },
                {
                    name: 'password',
                    type: 'varchar',
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'lastLogin',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('users');
    }
}
exports.CreateUserTable1712160000000 = CreateUserTable1712160000000;
//# sourceMappingURL=1712160000000-CreateUserTable.js.map