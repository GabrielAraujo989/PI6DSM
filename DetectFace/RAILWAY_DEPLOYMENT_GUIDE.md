# Guia Completo de Deployment Contínuo do DetecFace no Railway

Este guia detalha o processo completo para configurar o deployment contínuo do DetecFace no Railway, desde a criação da conta até o monitoramento pós-deploy.

## Índice

1. [Criar Conta no Railway](#criar-conta-no-railway)
2. [Configurar Novo Projeto no Railway](#configurar-novo-projeto-no-railway)
3. [Conectar Repositório GitHub ao Railway](#conectar-repositório-github-ao-railway)
4. [Configurar Variáveis de Ambiente no Railway](#configurar-variáveis-de-ambiente-no-railway)
5. [Configurar Railway Token no GitHub](#configurar-railway-token-no-github)
6. [Fazer o Primeiro Deploy Manual](#fazer-o-primeiro-deploy-manual)
7. [Verificar se o Deploy foi Bem-Sucedido](#verificar-se-o-deploy-foi-bem-sucedido)
8. [Testar a API Após o Deploy](#testar-a-api-após-o-deploy)

## 1. Criar Conta no Railway

### Passos:

1. Acesse [https://railway.app](https://railway.app)
2. Clique em "Sign Up" no canto superior direito
3. Escolha uma das opções de cadastro:
   - **GitHub** (Recomendado): Facilita a integração com repositórios
   - Google
   - Email e senha

### Exemplo de Saída Esperada:

Após o cadastro bem-sucedido, você será redirecionado para o dashboard do Railway com uma mensagem de boas-vindas.

## 2. Configurar Novo Projeto no Railway

### Passos:

1. No dashboard do Railway, clique em "New Project"
2. Dê um nome ao seu projeto (ex: "detecface-api")
3. Escolha a região mais próxima dos seus usuários (ex: "US East")
4. Clique em "Create Project"

### Exemplo de Saída Esperada:

```
Project "detecface-api" created successfully!
Project ID: prj-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Region: US East
```

## 3. Conectar Repositório GitHub ao Railway

### Passos:

1. No seu projeto Railway, clique em "Add Service"
2. Selecione "GitHub" como fonte
3. Autorize o Railway a acessar sua conta GitHub (se ainda não o fez)
4. Selecione o repositório do DetecFace
5. Configure as opções:
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: `DetectFace` (se o projeto está numa subpasta)
   - **Dockerfile Path**: `Dockerfile` (já existe no projeto)
6. Clique em "Add Service"

### Exemplo de Saída Esperada:

```
Service "detecface-api" added successfully!
Repository: seu-usuario/DetectFace
Branch: main
Root Directory: DetectFace
```

## 4. Configurar Variáveis de Ambiente no Railway

### Passos:

1. No seu serviço, clique na aba "Variables"
2. Clique em "New Variable"
3. Adicione as seguintes variáveis de ambiente:

```
PORT=8000
ENVIRONMENT=production
PYTHONUNBUFFERED=1
```

### Variáveis Opcionais (se aplicável):

```
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=seu-banco-de-dados-url
API_KEY=sua-api-key
DEBUG=false
```

### Dica:

- Para valores sensíveis, use referências a segredos do Railway:
  ```
  SECRET_KEY={{RAILWAY_PRIVATE_KEY}}
  ```

## 5. Configurar Railway Token no GitHub

### Passos:

1. No Railway, vá para "Account Settings" > "API Tokens"
2. Clique em "New Token"
3. Dê um nome ao token (ex: "GitHub Actions")
4. Copie o token gerado

### Configurar no GitHub:

1. No seu repositório GitHub, vá para "Settings" > "Secrets and variables" > "Actions"
2. Clique em "New repository secret"
3. Nome: `RAILWAY_TOKEN`
4. Valor: cole o token copiado do Railway
5. Clique em "Add secret"

### Verificar Workflow:

O arquivo `.github/workflows/deploy-railway.yml` já deve estar configurado para usar este token.

## 6. Fazer o Primeiro Deploy Manual

### Via Interface Web:

1. No seu serviço Railway, clique em "Deployments"
2. Clique em "New Deployment"
3. Selecione a branch desejada
4. Clique em "Deploy Now"

### Via CLI (Opcional):

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Fazer deploy
railway up
```

### Exemplo de Saída Esperada:

```
Building Docker image...
Pushing to registry...
Deployment started...
Deployment completed successfully!
```

## 7. Verificar se o Deploy foi Bem-Sucedido

### Verificação Visual:

1. No dashboard Railway, o status do deployment deve aparecer como "✅ Deployed"
2. Clique no deployment para ver detalhes

### Verificação via Logs:

1. Vá para "Logs" no seu serviço
2. Procure por mensagens como:
   ```
   Application started successfully
   Server running on port 8000
   ```

### Verificação via URL:

1. Copie a URL do seu serviço (ex: `https://detecface-api.up.railway.app`)
2. Acesse a URL no navegador
3. Você deve ver a página inicial da API ou uma mensagem de sucesso

### Comandos Úteis:

```bash
# Verificar status do serviço
railway status

# Verificar logs em tempo real
railway logs

# Verificar variáveis de ambiente
railway variables
```

## 8. Testar a API Após o Deploy

### Teste Básico de Conectividade:

```bash
# Substitua pela sua URL do Railway
curl https://detecface-api.up.railway.app/health

# Resposta esperada:
{"status": "healthy", "timestamp": "2024-01-01T12:00:00Z"}
```

### Teste de Detecção de Faces:

```bash
# Testar endpoint de detecção
curl -X POST \
  https://detecface-api.up.railway.app/detect \
  -H 'Content-Type: application/json' \
  -d '{"image_url": "https://example.com/face.jpg"}'

# Resposta esperada:
{
  "faces": [
    {
      "confidence": 0.98,
      "bbox": [x, y, width, height]
    }
  ],
  "processing_time": 0.123
}
```

### Teste com Arquivo Local:

```bash
# Enviar imagem local
curl -X POST \
  https://detecface-api.up.railway.app/detect \
  -F 'file=@/caminho/para/sua/imagem.jpg'
```

### Scripts de Teste Automatizado:

Use o script `post-deploy-checks.md` para verificações detalhadas.

## Dicas e Solução de Problemas

### Deployment Falhou:

1. Verifique os logs no Railway
2. Confirme que o Dockerfile está correto
3. Verifique se todas as dependências estão no requirements.txt

### Variáveis de Ambiente Não Funcionam:

1. Verifique se os nomes estão exatamente corretos
2. Reinicie o serviço após adicionar variáveis
3. Use `railway variables` para verificar

### Performance Lenta:

1. Verifique os logs de performance
2. Considere upgrade do plano Railway
3. Otimize o Dockerfile (veja DOCKER_OPTIMIZATION_GUIDE.md)

## Próximos Passos

1. Configure monitoramento e alertas
2. Implemente testes automatizados no pipeline
3. Configure domínio personalizado
4. Implemente estratégias de backup

## Recursos Úteis

- [Documentação Oficial do Railway](https://docs.railway.app/)
- [Guia de Docker para DetecFace](./DOCKER_OPTIMIZATION_GUIDE.md)
- [Script de Configuração Automática](./setup-railway.sh)
- [Verificações Pós-Deploy](./post-deploy-checks.md)