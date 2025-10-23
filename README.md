# Projeto PI6DSM – Sistema de Gerenciamento, Detecção e Reconhecimento Facial

Bem-vindo ao repositório do Projeto Integrador do 6º semestre! Este projeto reúne backend, frontend, detecção e reconhecimento facial, além de todo o pipeline de treinamento de modelos, compondo uma solução robusta, modular e escalável.

## Sumário
- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Módulos do Projeto](#módulos-do-projeto)
  - [Backend (service)](service/README.md)
  - [Frontend (Mobile/Web)](frontend/README.md)
  - [Detecção Facial (DetectFace)](DetectFace/README.md)
  - [Treinamento de Modelos](Treinamento/README.md)
  - [Deployment no Railway](#deployment-no-railway)
  - [Como Executar](#como-executar)
  - [Contribuição](#contribuição)
  - [Licença](#licença)

---

## Visão Geral
Este repositório integra todos os componentes necessários para um sistema completo de gerenciamento de usuários, autenticação, detecção e reconhecimento facial, com interface mobile/web e pipeline de treinamento de modelos de IA.

## Arquitetura
```
Usuário ↔️ Frontend (React Native/Expo) ↔️ Backend (NestJS) ↔️ Banco de Dados (PostgreSQL)
                                      ↕
                        Detecção/Reconhecimento Facial (YOLO, Python, Node)
                                      ↕
                        Treinamento de Modelos (datasets, scripts, notebooks)
```

## Módulos do Projeto

### 📦 [service/ – Backend (NestJS)](service/README.md)
API RESTful para gerenciamento de usuários, autenticação JWT, controle de acesso, integração com reconhecimento facial e conformidade com LGPD.

- Níveis de usuário: Super Usuário, Administrador, Cliente
- Segurança avançada e validação de dados
- Documentação completa: [service/README.md](service/README.md)

### 📱 [frontend/ – Frontend (React Native/Expo)](frontend/README.md)
Aplicativo mobile/web para cadastro, login, monitoramento facial e interação com o backend.

- Telas modernas e responsivas
- Integração com câmera e upload de imagens
- Documentação completa: [frontend/README.md](frontend/README.md)

### 🤖 [DetectFace/ – Detecção e Reconhecimento Facial](DetectFace/README.md)
Scripts, modelos e sistemas para detecção e reconhecimento facial usando YOLO e Node.js.

- Testes com vídeos e imagens
- Sistema de reconhecimento integrado
- Documentação completa: [DetectFace/README.md](DetectFace/README.md)

### 🧠 [Treinamento/ – Pipeline de Treinamento de Modelos](Treinamento/README.md)
Datasets, scripts, notebooks e documentação para treinar modelos de detecção facial.

- Datasets organizados e prontos para uso
- Notebooks e scripts para YOLO e outros frameworks
- Documentação detalhada: [Treinamento/README.md](Treinamento/README.md)
  - [Documentação dos Datasets](Treinamento/Documentation/README.md)

---

## 🚀 Deployment no Railway

O DetecFace pode ser implantado facilmente no Railway através de um pipeline de CI/CD automatizado. Para mais detalhes, consulte o [Resumo de Deployment](DEPLOYMENT_SUMMARY.md).

### Pré-requisitos
- Conta no Railway (https://railway.app)
- Repositório GitHub conectado ao Railway
- Railway Token configurado nos secrets do GitHub

### Comandos Principais
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login

# Fazer deploy
railway up

# Verificar status
railway status
```

### Links Úteis
- [Documentação Completa](DEPLOYMENT_SUMMARY.md)
- [Guia de Deployment Detalhado](DetectFace/RAILWAY_DEPLOYMENT_GUIDE.md)
- [Verificações Pós-Deployment](DetectFace/post-deploy-checks.md)

---

## Como Executar

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/seu-repo.git
   cd PI6DSM
   ```
2. **Siga as instruções de cada módulo:**
   - [Backend](service/README.md)
   - [Frontend](frontend/README.md)
   - [Detecção Facial](DetectFace/README.md)
   - [Treinamento](Treinamento/README.md)

3. **Configure variáveis de ambiente e dependências conforme cada README.**

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NomeDaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Push para sua branch (`git push origin feature/NomeDaFeature`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

> Projeto desenvolvido por alunos do 6º semestre de DSM – FATEC
