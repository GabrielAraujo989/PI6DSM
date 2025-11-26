# Sprint 1
Foi executado uma analise inicial para entrega da primeira sprint. Dentro da entrega estão:
- [X] [Definição do escopo e requisitos](#escopo) ([funcionais](#requisitos-funcionais-rf) e [não funcionais](#requisitos-não-funcionais-rnf))
- [X] Modelagem inicial ([diagramas de caso de uso](./diagrama_caso_de_uso.svg), arquitetura ou equivalente)
- [X] [Criação do repositório Grupo](https://github.com/GabrielAraujo989/PI6DSM) (Github)
- [X] [Estrutura inicial do back-end(estrutura em postman)](../../service/postman_tests.txt) (framework e API configurada)
- [X] [Protótipo inicial do front-end](../../frontend/) (telas estáticas)
- [X] [Banco de dados modelado](./DER.svg) (conceitual e lógico)
- [X] **Computação em Nuvem II**: [definição e justificativa dos serviços em nuvem a serem utilizados](#computação-em-nuvem-ii)
- [X] **Mineração de Dados**: [definição da base de dados e planejamento inicial das técnicas de mineração](#mineração-de-dados)

## Escopo
### Objetivo Geral
Desenvolver um sistema integrado capaz de **reconhecer rostos em tempo real** e **gerenciar usuários e autorizações**, com interface web/mobile e backend seguro, usando IA e banco de dados relacional.

### Módulos principais
1. **Frontend (React Native / Expo)**
    - Interface de login e cadastro de usuários;
    - Dashboard com monitoramento em tempo real;
    - Exibição de imagens e informações detectadas.

2. **Service (NestJS + TypeORM)**
    - API central com autenticação JWT;
    - Gerenciamento de usuários (CRUD + permissões);
    - Integração com serviço de IA via API;
    - Armazenamento de dados no PostgreSQL.

3. **DetectFace (Python + YOLO)**
    - Detecção e reconhecimento facial;
    - Servidor de inferência com endpoints REST (`server.py`);
    - Envio de resultados para o backend.

4. **Treinamento (YOLOv8 / notebooks)**
    - Treinamento e ajuste do modelo de detecção facial;
    - Avaliação de versões e métricas.

---

## Requisitos Não Funcionais (RNF)
| Código | Requisito            | Descrição                                                                |
| ------ | -------------------- | ------------------------------------------------------------------------ |
| RNF01  | **Desempenho**       | O reconhecimento facial deve responder em menos de 2 segundos.           |
| RNF02  | **Segurança**        | As APIs devem usar **JWT**.                                              |
| RNF03  | **Portabilidade**    | O frontend deve ser compatível com **Android** e **Web**.                |
| RNF04  | **Escalabilidade**   | O backend deve ser modular e containerizado (Docker).                    |
| RNF05  | **Manutenibilidade** | O código deve seguir padrões de estilo (`eslint`, `tsconfig`, `nestjs`). |
| RNF06  | **Persistência**     | Banco de dados PostgreSQL com versionamento via **migrations**.          |


## Requisitos Funcionais (RF)
| Código | Requisito                                                                         | Módulo                |
| ------ | --------------------------------------------------------------------------------- | --------------------- |
| RF01   | O sistema deve permitir o **cadastro e autenticação de usuários**.                | Service / Frontend    |
| RF02   | O sistema deve permitir **upload de imagens** para reconhecimento.                | Frontend / DetectFace |
| RF03   | O módulo de IA deve **detectar e identificar rostos conhecidos**.                 | DetectFace            |
| RF04   | O backend deve **armazenar informações de usuários, logs e imagens processadas**. | Service               |
| RF05   | O frontend deve **mostrar em tempo real os rostos reconhecidos**.                 | Frontend              |
| RF06   | O sistema deve permitir **gerenciamento de perfis e permissões**.                 | Service               |
| RF07   | O sistema deve registrar **logs de eventos de reconhecimento facial**.            | Service               |

## Computação em Nuvem II
Neste projeto, a Computação em Nuvem é empregada para hospedar e gerenciar a base de dados de forma escalável e segura. Será utilizado um **banco de dados gerenciado em nuvem**, permitindo abstrair tarefas administrativas como backup, atualização e balanceamento de carga. Essa abordagem garante **alta disponibilidade, confiabilidade e facilidade de integração** com ferramentas analíticas e pipelines de dados. A escolha de um serviço gerenciado — como **MySQL ou PostgreSQL em provedores como Google Cloud SQL, AWS RDS ou Azure Database**. Além disso, o uso da nuvem permite o **trabalho colaborativo entre os membros do grupo**, simplificando a implantação e a reprodutibilidade dos resultados.

### Mineração de Dados
A base de dados para a mineração foi composta principalmente pelos conjuntos **Face Detection.v27i.yolov11** e **WIDER_FACE**, ambos estruturados para tarefas de detecção facial e divididos em subconjuntos de treinamento, validação e teste. Esses datasets incluem imagens anotadas com as classes “face” e “background”, permitindo o aprendizado supervisionado de modelos baseados em visão computacional.

O planejamento inicial das técnicas de mineração considerou a utilização de **modelos YOLO (You Only Look Once)** para extrair padrões de detecção de faces em diferentes condições visuais. As etapas envolveram a configuração de parâmetros de treinamento, como tamanho de imagem e batch size, e o uso de scripts Python e notebooks para a execução experimental. Essa abordagem possibilita avaliar a capacidade preditiva dos modelos e ajustar suas métricas de desempenho de forma iterativa.