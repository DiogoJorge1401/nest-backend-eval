## Visão Geral

Este repositório contém um desafio para desenvolvedores backend, simulando um
**backend bancário**. O objetivo é avaliar as habilidades de desenvolvimento,
integrando com um **mock backend** fornecido, que simula endpoints de
autenticação e operações bancárias básicas (abertura de conta e transferência).

## O Desafio

Você deve criar um backend (em qualquer linguagem e framework de sua
preferência, sendo **NestJS/TypeScript apenas uma sugestão**) que permita: •
**Abertura de conta** (Cadastro de usuário). • **Processo KYC simulado** (upload
de documento e selfie). • **Extrato da conta** (listar transações). •
**Transferência** (integração com o mock backend fornecido). Seu backend deverá:

1. Expor endpoints REST para: ◦ Abertura de conta (por exemplo,
   `POST /account/open`). ◦ KYC (ex: `POST /kyc/upload-doc` e
   `POST /kyc/upload-selfie`). ◦ Extrato (ex: `GET /statement`). ◦ Transferência
   (ex: `POST /transfer`).
2. Integrar-se ao **mock backend** (instruções abaixo) para efetuar a
   transferência e simular a abertura de conta remota, enviando um token obtido
   via endpoint de autenticação do mock.
3. Incluir uma documentação própria (README) explicando como rodar seu projeto
   localmente, incluindo: ◦ Pré-requisitos específicos (runtime, dependências,
   etc.). ◦ Passos de instalação do seu backend. ◦ Como executar sua aplicação e
   testes. ◦ Como integrá-la ao mock backend (endereço, portas, etc.).

## O Mock Backend

Este repositório já contém um mock backend Dockerizado. Ele expõe endpoints
básicos: • **POST /mock-auth/token**: Recebe `client_id` e `client_secret` fixos
(`test` e `secret`) e retorna um `access_token`. • **POST /mock-account/open**:
Recebe `Authorization: Bearer <access_token>` e simula abertura de conta
retornando `{"status":"ok"}`. • **POST /mock-transfer**: Recebe
`Authorization: Bearer <access_token>` e dados de transferência, retornando
`{"status":"ok"}`.

## Como Subir o Mock Backend

1. Certifique-se de ter Docker e Docker Compose instalados.
2. No diretório raiz deste repositório, execute: docker-compose up -d
3. O mock backend ficará acessível em `http://localhost:8080`.

## Sua Entrega

Você deverá criar sua solução em uma pasta separada ou em um repositório
próprio. Nesta solução:

- Incluir um README.md detalhando:

  - Quais pré-requisitos são necessários (por exemplo, Node.js, Python, .NET).
  -     Como instalar as dependências do seu projeto.
  - Como rodar sua aplicação.
  - Como rodar seus testes.
  - Como apontar sua aplicação para o mock backend (ex: variáveis de ambiente).

- Fornecer instruções claras de autenticação e uso dos endpoints.

## Critérios de Avaliação

1. **Qualidade do Código:** Organização, clareza, padrões, testes.
2. **Cobertura e Qualidade de Testes:** Presença de testes automatizados.
3. **Funcionalidades Implementadas:** Adesão às funcionalidades solicitadas
   (abertura de conta, KYC, extrato, transferência).
4. **Integração com Mock Backend**: Uso correto do token obtido pelo
   `/mock-auth/token` na chamada `/mock-transfer` e `/mock-account/open`.
5. **Documentação:** Instruções claras de instalação, execução e testes.

## Observação

- Não há dependências para instalar neste repositório além do mock backend. Toda
  a implementação do backend bancário é por sua conta.
- O uso de NestJS/TypeScript é apenas sugerido; você pode optar por outra
  tecnologia.
- O macOS e Linux são ambientes recomendados para testes, mas não obrigatórios.
  Ajuste suas instruções conforme o ambiente que você escolher.
- A documentação final do seu projeto deve conter as instruções específicas de
  instalação e execução da sua stack escolhida.

### Endpoints Esperados (Exemplo)

**A aplicação principal (seu backend)** deve fornecer os seguintes endpoints
(sugestões):

- **POST /auth/register**: Cria um usuário (para simular abertura de conta).
- **POST /auth/login**: Retorna um token JWT próprio para acesso aos demais
  endpoints.
- **POST /kyc/upload-doc**: Recebe documento do cliente (arquivo ou base64).
- **POST /kyc/upload-selfie**: Recebe selfie do cliente.
- **GET /statement**: Retorna extrato da conta.
- **POST /transfer**: Realiza transferência. Internamente, seu backend chamará o
  `http://mock-backend:8080/transfer` (ajustar host/porta conforme config)
  enviando o token obtido do mock-backend.

## Considerações Finais

- O candidato pode escolher outro framework ou linguagem, desde que justifique,
  mas NestJS/TypeScript é a abordagem preferencial.
- O mock backend não deve ser alterado pelo candidato, apenas consumido.
- O candidato deve priorizar segurança básica, organização do código e
  documentação.
