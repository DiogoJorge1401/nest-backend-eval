# Nest Backend Eval

Este projeto é um backend que simula algumas operações básicas bancárias desenvolvido em **NestJS/TypeScript** que permite:

- **Abertura de conta** (Cadastro de usuário)
- **Processo KYC simulado** (upload de documento e selfie)
- **Extrato da conta** (listar transações)
- **Transferência** (integração com o mock backend fornecido)

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **yarn, npm ou bun** (para instalar as dependências do projeto e rodar os scripts)
- **Docker** e Docker Compose (para executar o mock backend)

## Instalação

**1. Clone o repositório**

```bash
git clone https://github.com/DiogoJorge1401/nest-backend-eval
cd nest-backend-eval
```

**2. Instale as dependências**

```bash
yarn install
```

## Como rodar a aplicação

**1. Iniciar MongoDB, Redis e o mock backend**

No diretório raiz deste repositório, execute:

```bash
  docker-compose up -d
```

**2. Configurar Variáveis de Ambiente**

Renomeie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente caso ache necessário.

**Observação**: Substitua os valores das chaves `JWT_SECRET` e `JWT_REFRESH_SECRET` por valores seguros.

**3. Iniciar a aplicação**

```bash
  yarn start:dev
```

## Como rodar os testes

Execute:

```bash
  yarn test:e2e
```

Para gerar o relatório de cobertura de testes, execute:

```bash
  yarn test:cov
```

## Documentação da API

A documentação completa da API, incluindo detalhes de todos os endpoints e modelos, está disponível via Swagger em:

`http://localhost:3001/v1/api/docs`

## Instruções de Autenticação e Uso dos Endpoints

**1. Registrar Usuário:**

- Utilize o endpoint `POST /auth/register` para criar uma nova conta.

**2. Autenticar Usuário:**

- Utilize o endpoint `POST /auth/login` com as credenciais cadastradas.
- O endpointvinculará um jwt e um jwt_refresh aos cookies do usuário autenticado que será utilizado nos demais endpoints protegidos.

**3. Acessar Endpoints Protegidos:**

- Para acessar os endpoints protegidos, utilize o jwt e jwt_refresh vinculados aos cookies do usuário autenticado.

## Demonstração da Aplicação

**Acesse o [Link](https://nest-backend-eval-production.up.railway.app/v1/api/docs) para visualizar a aplicação em funcionamento**
