#!/bin/bash

# Script de Configuração Automática do DetecFace no Railway
# Este script automatiza a configuração inicial do projeto no Railway

set -e  # Interrompe o script se algum comando falhar

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar se estamos no diretório correto
check_directory() {
    print_step "Verificando diretório do projeto..."
    
    if [ ! -f "server.py" ] || [ ! -f "Dockerfile" ]; then
        print_error "Este script deve ser executado no diretório do DetecFace (onde estão server.py e Dockerfile)"
        exit 1
    fi
    
    print_message "Diretório verificado com sucesso!"
}

# Verificar dependências necessárias
check_dependencies() {
    print_step "Verificando dependências necessárias..."
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado. Por favor, instale o Git primeiro."
        exit 1
    fi
    
    # Verificar Node.js (para Railway CLI)
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Por favor, instale o Node.js primeiro."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado. Por favor, instale o npm primeiro."
        exit 1
    fi
    
    print_message "Todas as dependências estão instaladas!"
}

# Instalar Railway CLI
install_railway_cli() {
    print_step "Instalando Railway CLI..."
    
    if command -v railway &> /dev/null; then
        print_warning "Railway CLI já está instalado. Verificando atualizações..."
        npm update -g @railway/cli
    else
        print_message "Instalando Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Verificar instalação
    if command -v railway &> /dev/null; then
        print_message "Railway CLI instalado com sucesso!"
        railway --version
    else
        print_error "Falha ao instalar Railway CLI"
        exit 1
    fi
}

# Fazer login no Railway
login_railway() {
    print_step "Fazendo login no Railway..."
    
    # Verificar se já está logado
    if railway whoami &> /dev/null; then
        print_message "Você já está logado no Railway como:"
        railway whoami
        read -p "Deseja fazer login com outra conta? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            railway login
        fi
    else
        print_message "Redirecionando para o login no Railway..."
        railway login
    fi
    
    # Verificar login novamente
    if railway whoami &> /dev/null; then
        print_message "Login realizado com sucesso!"
        railway whoami
    else
        print_error "Falha no login. Por favor, tente novamente."
        exit 1
    fi
}

# Verificar ou criar projeto no Railway
setup_project() {
    print_step "Configurando projeto no Railway..."
    
    # Verificar se já existe um projeto Railway
    if [ -f ".railway/project.json" ]; then
        print_message "Projeto Railway já configurado:"
        cat .railway/project.json | grep -E '"id"|"name"'
        read -p "Deseja criar um novo projeto? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            create_new_project
        fi
    else
        create_new_project
    fi
}

# Criar novo projeto
create_new_project() {
    print_message "Criando novo projeto no Railway..."
    
    # Solicitar nome do projeto
    read -p "Digite o nome do projeto (padrão: detecface-api): " PROJECT_NAME
    PROJECT_NAME=${PROJECT_NAME:-detecface-api}
    
    # Criar projeto
    railway init --name "$PROJECT_NAME"
    
    print_message "Projeto '$PROJECT_NAME' criado com sucesso!"
}

# Configurar variáveis de ambiente
setup_environment() {
    print_step "Configurando variáveis de ambiente..."
    
    # Variáveis básicas
    railway variables set PORT=8000
    railway variables set ENVIRONMENT=production
    railway variables set PYTHONUNBUFFERED=1
    
    # Variáveis opcionais
    read -p "Deseja configurar SECRET_KEY? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Digite a SECRET_KEY (ou deixe em branco para gerar automaticamente): " SECRET_KEY
        if [ -z "$SECRET_KEY" ]; then
            SECRET_KEY=$(openssl rand -hex 32)
        fi
        railway variables set SECRET_KEY="$SECRET_KEY"
    fi
    
    read -p "Deseja configurar DATABASE_URL? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Digite a DATABASE_URL: " DATABASE_URL
        railway variables set DATABASE_URL="$DATABASE_URL"
    fi
    
    print_message "Variáveis de ambiente configuradas:"
    railway variables list
}

# Verificar configuração do Docker
verify_docker() {
    print_step "Verificando configuração do Docker..."
    
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile não encontrado!"
        exit 1
    fi
    
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt não encontrado!"
        exit 1
    fi
    
    print_message "Arquivos Docker verificados com sucesso!"
}

# Fazer deploy inicial
deploy_project() {
    print_step "Iniciando deploy inicial..."
    
    # Verificar se há alterações não commitadas
    if ! git diff-index --quiet HEAD --; then
        print_warning "Existem alterações não commitadas no repositório."
        read -p "Deseja fazer commit das alterações antes do deploy? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            git add .
            git commit -m "Preparar para deploy no Railway"
            print_message "Alterações commitadas!"
        fi
    fi
    
    # Fazer deploy
    print_message "Iniciando deploy..."
    railway up
    
    print_message "Deploy iniciado! Aguarde a conclusão..."
    print_message "Você pode acompanhar o progresso em: https://railway.app/project/$(railway project id)"
}

# Exibir informações pós-deploy
post_deploy_info() {
    print_step "Informações pós-deploy..."
    
    # Obter URL do projeto
    PROJECT_URL=$(railway domain)
    
    print_message "Seu projeto foi deployado com sucesso!"
    print_message "URL do projeto: $PROJECT_URL"
    
    print_message "Comandos úteis:"
    echo "  railway status          - Verificar status do projeto"
    echo "  railway logs            - Verificar logs"
    echo "  railway open            - Abrir projeto no navegador"
    echo "  railway variables list  - Listar variáveis de ambiente"
    echo "  railway up              - Fazer novo deploy"
    
    print_message "Para testar a API:"
    echo "  curl $PROJECT_URL/health"
    
    print_warning "Não se esqueça de:"
    echo "  1. Configurar o Railway Token no GitHub (ver RAILWAY_DEPLOYMENT_GUIDE.md)"
    echo "  2. Executar as verificações pós-deploy (ver post-deploy-checks.md)"
}

# Função principal
main() {
    print_message "Iniciando configuração do DetecFace no Railway..."
    echo
    
    check_directory
    check_dependencies
    install_railway_cli
    login_railway
    setup_project
    verify_docker
    setup_environment
    deploy_project
    post_deploy_info
    
    echo
    print_message "Configuração concluída com sucesso!"
    print_message "Para mais informações, consulte RAILWAY_DEPLOYMENT_GUIDE.md"
}

# Executar função principal
main "$@"