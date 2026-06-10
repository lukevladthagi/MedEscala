# MedEscala

Sistema web para gestão de escalas médicas, colaboradores, check-ins, cargos, treinamentos, reuniões e indicadores operacionais.

## Objetivo

O MedEscala centraliza a organização das escalas hospitalares e o acompanhamento de presença, permitindo que a equipe responsável cadastre profissionais, configure cargos e vínculos, registre escalas, acompanhe check-ins e consulte indicadores de gestão.

## Principais Recursos

- Dashboard executivo com indicadores gerais.
- Cadastro de médicos, funcionários e profissionais vinculados.
- Cadastro de cargos e funções com regras de carga horária.
- Gestão de escalas por setor, período e profissional.
- Registro e acompanhamento de check-ins.
- Módulo de treinamentos e reuniões.
- Indicadores e BIQ para acompanhamento gerencial.
- Área administrativa para manutenção dos cadastros.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth
- Neon PostgreSQL
- Yarn Workspaces

## Estrutura do Projeto

```text
apps/
  web/      Aplicação web principal
  mobile/   Estrutura mobile gerada junto ao projeto
config/     Arquivos auxiliares de execução
publisher/  Arquivos de publicação gerados pela plataforma
```

## Configuração Local

Crie o arquivo `apps/web/.env.local` com as variáveis necessárias:

```env
DATABASE_URL=sua_string_do_postgresql
AUTH_SECRET=um_segredo_seguro
BETTER_AUTH_SECRET=um_segredo_seguro
AUTH_URL=url_local_da_aplicacao
BETTER_AUTH_URL=url_local_da_aplicacao
NEXT_PUBLIC_AUTH_URL=url_local_da_aplicacao
NEXT_PUBLIC_CREATE_BASE_URL=url_local_da_aplicacao
NEXT_PUBLIC_CREATE_HOST=host_local_da_aplicacao
NEXT_PUBLIC_PROJECT_GROUP_ID=medescala-local
```

Não versionar arquivos `.env` ou credenciais.

## Instalação

```bash
corepack enable
yarn install
```

## Execução Local

```bash
yarn workspace web next dev --port 4005
```

A aplicação ficará disponível localmente no navegador na porta configurada.

## Scripts Úteis

```bash
yarn workspace web typecheck
yarn workspace web build
```

## Banco de Dados

O projeto utiliza PostgreSQL. As principais tabelas usadas pela aplicação são:

- `medicos`
- `cargos_funcoes`
- `escalas`
- `checkins`
- `treinamentos`
- `treinamentos_participantes`
- `reunioes`
- `reunioes_participantes`
- tabelas de autenticação do Better Auth

## Observações

- O login suporta autenticação por e-mail e senha.
- A autenticação social pode ser habilitada configurando as credenciais do provedor desejado.
- Antes de publicar em produção, configure variáveis de ambiente próprias para o ambiente final.
