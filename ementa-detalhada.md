## Observações

- Por simplicidade, vamos utilizar o `npm`.
- Cada pacote que for instalado em aula, o comando deve especificar a exatamente a versão.
Exemplo: `npm install axios@1.15.2`
O objetivo aqui é evitar breaking changes devido a atualizações dessas libs.
Para ajudar os alunos, nós vamos disponibilizar esses comandos na descrição da aula.
- Editor de texto recomendado é o VSCode, devido a popularidade e simplicidade, o aluno tem mais familiaridade com ele.
- Evitar alteração de conteúdo fora de aula.

## 🔹 Nível 1: Fundamentos do Runtime (A Base)

*Foco: Entender a ferramenta antes de usar.*

- **Módulo 1: O Ecossistema Node.js**
    - Node.js vs Browser: O que muda? (window vs global, sistema de arquivos).
    - Como o Node.js funciona: V8, Libuv, Thread Pool e a arquitetura não-bloqueante.
    - Single Thread vs Multi Thread: Quando o Node brilha e quando não usar.
    - Gerenciamento de pacotes (NPM/PNPM/BUN).
    - Scripts no `⁠package.json`.
- **Módulo 2: Dominando o Assincronismo (Crucial)**
    - Event Loop, Call Stack e Task Queues.
    - O problema do Callback Hell.
    - Promises: Anatomia, `⁠then`, `⁠catch`, `⁠finally`.
    - Promises Async/Await: A forma moderna e tratamento de erros com Try/Catch.
    - Promises API: `⁠Promise.all`, `⁠Promise.race`, `Promise.allSettled` e `Promise.any` `⁠resolve/reject` , etc.
- **Módulo 3: Módulos Nativos e Streams**
    - Sistema de Módulos: CommonJS (`⁠require`) vs ES Modules (`⁠import`).
    - Events Module: O padrão Observer nativo do Node.
    - Módulos Nativos essenciais e novidade: `SQLite`, `⁠fs`, `⁠path`, `⁠http`, `⁠os`, `⁠events`.
    - Buffers: Entendendo dados binários.
    - Streams e Buffers: Manipulando grandes arquivos sem estourar a memória.
    - **Prática**: Criar um script que lê múltiplos arquivos CSV e processa os dados de forma assíncrona.

---

## 🔹 Nível 2: Protocolo HTTP com Node.js Puro ("The Hard Way")

*Objetivo:* Construir uma API REST usando **apenas módulos nativos**, entender o protocolo HTTP e construir as primeiras rotas REST. Essencialmente, criar seu próprio "mini-framework" para entender como o Express/Fastify funcionam internamente.

- **Módulo 1: O Protocolo HTTP**
    - Verbos (GET, POST, PUT, PATCH, DELETE).
    - Status Codes (2xx, 4xx, 5xx) - Semântica correta.
    - Headers, Body, Query Params e Route Params.
- **Módulo 2: O Módulo `http`**
    - Criando um servidor com `http.createServer`.
    - `req` e `res`: Entendendo que são Streams (Readable e Writable).
    - Manipulando Status Codes e Headers manualmente.
- **Módulo 3: Roteamento Manual**
    - Lógica de rotas com `if/else` ou `switch` baseada em URL e Método.
    - Extraindo Query Params da URL nativamente.
    - RegEx básico para identificar rotas dinâmicas (ex: `/users/1`).
- **Módulo 4: Processando o Body**
    - Ouvindo eventos `data` e `end` para montar o corpo da requisição.
    - Fazendo o parse de JSON manualmente (`JSON.parse` com Try/Catch).
    - Lidando com erros de JSON inválido.
    - *Desafio:* Criar um CRUD de usuários salvando em um arquivo JSON local, sem nenhum framework.
- **Módulo 5: Configuração de build**
    - Organizando o projeto.
    - Scripts úteis no `package.json`.

---

## 🔹 Nível 3: Tooling Profissional: TypeScript, Frameworks e Validação

*Objetivo:* Agora que sabemos como é difícil fazer na mão, introduzimos as ferramentas profissionais para ganhar produtividade e padronização.

- **Módulo 1: TypeScript no Backend (O novo padrão)**
    - Por que TypeScript? (Tipagem Estática vs Dinâmica).
    - Configurando o ambiente: `⁠tsconfig.json`, ⁠`tsx`/`⁠ts-node`.
    - Tipos Primitivos, Interfaces e Tipagem de Funções.
    - Generics e Utility Types (`Partial`, `Pick`, `Omit`, etc)
- **Módulo 2: Adotando um Framework (Fastify)**
    - Comparativo: O que o framework abstrai do Nível 2?
    - Roteamento declarativo e Middlewares.
    - Contexto da requisição.
    - Plugins
- **Módulo 3: Validação e Segurança de Dados**
    - Por que nunca confiar no input do usuário?
    - Schema Validation com Zod: Tipagem e validação em um só lugar.
    - Validação e Serialização de dados na API.
- **Módulo 4: Documentação Automatizada (Swagger/OpenAPI)**
    - A importância do "Contrato" da API.
    - Gerando a documentação da API automaticamente a partir dos Schemas do Zod (Code-First documentation).
    - Swagger UI: Expondo a rota `/docs`.
    - Versionamento de API (v1, v2).
- **Módulo 5: Tratamento de Erros e Logs**
    - Evitando o "crash" da aplicação.
    - Classe de Erro personalizada (AppError).
    - Capturando erros assíncronos globalmente.

---

## 🔹 Nível 4: Segurança e Autenticação

*Objetivo:* Implementar segurança avançada.
*Contexto:* Usaremos dados em memória (Mock) para focar puramente na lógica de segurança antes de conectar ao banco.

- **Módulo 1: Fundamentos de Criptografia**
    - Hashing vs Encriptação.
    - Usando `bcrypt` para proteger senhas.
- **Módulo 2: Autenticação e Autorização**
    - Conceito de Stateless Authentication.
    - JWT (JSON Web Tokens): O que são e como funcionam.
    - Criando tokens (Sign) e Validando (Verify).
    - Middleware de Autenticação (`EnsureAuthenticated`).
    - Refresh Token Strategy (Segurança avançada).
    - Recuperando o usuário logado dentro das rotas.
    - RBAC (mesmo que simples)

---

## 🔹 Nível 5: Docker e Persistência de Dados

*Objetivo:* Infraestrutura e Dados.

- **Módulo 1: Ambiente de Desenvolvimento com Docker**
    - Imagens e Containers.
    - Networking entre containers.
    - Volumes
    - Subindo um banco PostgreSQL com Docker Compose.
- **Módulo 2: A Evolução da Persistência (Teoria e Prática)**
    - Driver Nativo (⁠pg)
    - Query Builders (⁠Knex.js)
    - ORMs (Data Mapper vs Active Record?)
    - Análise de prós e contras arquiteturais.
- **Módulo 3: ORM (Prisma IO)** *Aqui pode ser outro ORM de sua escolha*
    - Modelagem de dados (Schema).
    - Migrations e Introspection.
    - Prisma Client
    - Seeds
- **Módulo 4: Relacionamentos e Regras Complexas**
    - Relacionando Usuários com Recursos (Ex: "Quem criou este evento?").
    - Foreign Keys e Constraints.
    - Transações (Atomicidade).
    - Problema de N+1 nas querys

---

## 🔹 Nível 6: Arquitetura e Testes

*Objetivo:* Organização e Qualidade.

- **Módulo 1: Arquitetura Limpa e SOLID**
    - Inversão de Dependência e DTOs (Data Transfer Objects) tipados.
    - Repository Pattern (Isolando o ORM).
    - Controllers / Use Cases / Services.
- **Módulo 2: Testes Automatizados**
    - Importância dos testes na qualidade do software.
    - Pirâmide de Testes.
    - Testes Unitários (Vitest).
    - Testes de Integração (Supertest vs `fastify.inject()`).

---

## 🔹 Nível 7: Escala e DevOps

*Objetivo:* Performance e Deploy.

- **Módulo 1: Escalabilidade**
    - Caching com Redis e estratégias de invalidação.
    - Filas e Background Jobs.
- **Módulo 2: CI/CD e Deploy**
    - GitHub Actions.
    - Deploy em plataforma Cloud.

---
