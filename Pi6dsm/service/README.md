# Sistema de Gerenciamento de Usuários

Este é um sistema de gerenciamento de usuários com diferentes níveis de acesso, desenvolvido com NestJS e PostgreSQL.

## Características

- Três níveis de usuários: Super Usuário, Administrador e Cliente
- Limite de 4 Super Usuários no sistema
- Super Usuários não podem ser alterados ou removidos
- Dados sensíveis protegidos de acordo com a LGPD
- Autenticação e autorização baseada em JWT
- Validação de dados com class-validator

## Requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
- Crie um banco de dados PostgreSQL
- Copie o arquivo `.env.example` para `.env`
- Atualize as variáveis de ambiente no arquivo `.env`

4. Execute as migrações:
```bash
npm run typeorm migration:run
```

5. Inicie o servidor:
```bash
npm run start:dev
```

## Estrutura de Usuários

### Super Usuário
- Limite de 4 usuários
- Não podem ser alterados ou removidos
- Acesso total ao sistema

### Administrador
- Podem gerenciar outros administradores e clientes
- Acesso a todas as funcionalidades exceto gerenciamento de Super Usuários

### Cliente
- Acesso limitado ao sistema
- Podem visualizar apenas seus próprios dados

## Segurança

- Senhas são armazenadas com hash bcrypt
- Tokens JWT para autenticação
- Validação de dados no backend
- Proteção contra ataques comuns
- Conformidade com LGPD

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
