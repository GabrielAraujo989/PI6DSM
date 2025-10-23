# Forçando Docker Builder no Railway

Este documento explica como configurar o projeto para forçar o uso do Docker builder no Railway em vez do Railpack, resolvendo o problema de detecção de linguagem (Node.js vs Python).

## Problema

O Railway estava detectando incorretamente Node.js em vez de Python para o projeto DetectFace, mesmo com as configurações anteriores. Isso causava falhas no build devido à instalação de dependências incorretas.

## Solução Implementada

Criamos uma configuração multi-camadas para forçar o uso do Docker builder:

### 1. railway.json (Raiz do Projeto)

Arquivo principal que sobrescreve a configuração automática do Railway:

- Força explicitamente o uso de `"builder": "DOCKERFILE"`
- Define o caminho correto para o Dockerfile: `"./DetectFace/Dockerfile"`
- Configura todas as variáveis de ambiente necessárias
- Define o Root Directory como `"./DetectFace"`

### 2. Dockerfile Alternativo (Raiz do Projeto)

Arquivo Dockerfile na raiz que serve como fallback:

- Aponta para o Dockerfile real em `./DetectFace/Dockerfile`
- Garante que o Railway sempre encontre um Dockerfile válido
- Funciona como um ponteiro para o arquivo de build real

### 3. .railway (Atualizado)

Arquivo de configuração do Railway atualizado para consistência:

- Reforça o uso do Docker builder
- Define explicitamente o caminho do Dockerfile
- Configura variáveis de ambiente consistentes
- Mantém o Root Directory configurado

### 4. TROUBLESHOOTING.md (Atualizado)

Documentação atualizada com:

- Nova seção "Forçando Docker Builder com railway.json"
- Instruções detalhadas de implementação
- Passos para verificação e troubleshooting
- Exemplos de configuração

## Como Funciona

1. O Railway detecta o arquivo `railway.json` na raiz do projeto
2. Este arquivo tem prioridade sobre outras configurações
3. A configuração `"builder": "DOCKERFILE"` força o uso do Docker builder
4. O `"sourceDir": "./DetectFace"` define o diretório raiz do projeto
5. O `"dockerfilePath": "./DetectFace/Dockerfile"` aponta para o Dockerfile real
6. O Railway usa o Dockerfile em vez do Railpack para construir o projeto

## Verificação

Após o deploy, verifique se está usando Docker builder:

```bash
# Verifica logs do build
railway logs --service detecface | grep -i docker

# Verifica se Python está sendo usado
railway logs --service detecface | grep -i python

# Verifica se as dependências foram instaladas
railway logs --service detecface | grep -i pip
```

## Arquivos Criados/Modificados

1. **railway.json** (Novo) - Configuração principal forçando Docker builder
2. **Dockerfile** (Novo) - Dockerfile alternativo na raiz como fallback
3. **.railway** (Modificado) - Atualizado para consistência com railway.json
4. **DetectFace/TROUBLESHOOTING.md** (Modificado) - Adicionada seção sobre railway.json

## Próximos Passos

1. Faça commit e push das alterações
2. Monitore o deploy no painel do Railway
3. Verifique se o builder mudou para DOCKERFILE
4. Confirme que Python está sendo usado corretamente
5. Teste a aplicação para garantir funcionalidade completa

## Benefícios

- **Força Explícita:** Sobrescreve a detecção automática do Railway
- **Configuração Centralizada:** Todas as configurações em um único arquivo
- **Prioridade Alta:** O Railway dá prioridade ao railway.json
- **Clareza:** Deixa explícito que queremos usar DOCKERFILE builder
- **Flexibilidade:** Permite configurações avançadas de build e deploy

---

**Data:** 23 de Outubro de 2025
**Versão:** 1.0