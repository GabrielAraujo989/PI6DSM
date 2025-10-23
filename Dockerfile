# Dockerfile alternativo na raiz do projeto
# Este arquivo redireciona para o Dockerfile real em DetectFace/
# Garante que o Railway encontre o Dockerfile mesmo com configurações complexas

# Usa o Dockerfile real do DetectFace como base
FROM ./DetectFace/Dockerfile

# Mantém todas as configurações do Dockerfile original
# Este arquivo serve apenas como um ponteiro para o Dockerfile real