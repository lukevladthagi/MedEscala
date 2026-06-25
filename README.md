# ProntoEscala

Sistema web para gestao de escalas, jornadas, check-ins, treinamentos, reunioes e indicadores operacionais.

## Objetivo

O ProntoEscala centraliza a organizacao da rotina de equipes hospitalares. A aplicacao permite cadastrar profissionais, vincular cargos, setores e jornadas de trabalho, acompanhar escalas e registrar presenca em eventos operacionais.

## Principais recursos

- Dashboard executivo com indicadores operacionais.
- Cadastro de funcionarios, medicos, cargos, funcoes, especialidades e setores.
- Vinculo de jornada de trabalho ao cadastro do profissional.
- Escala manual para plantonistas e medicos.
- Escala automatica por setor a partir da jornada cadastrada.
- Visualizacao da escala por horario completo ou por siglas.
- Impressao de escala mensal.
- Check-in e check-out com comprovante de presenca.
- Treinamentos e reunioes com lista de presenca.
- Agenda de eventos em formato de calendario.
- Modulos de BIQ, auditoria e administracao.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth
- PostgreSQL
- Yarn Workspaces

## Estrutura

```text
apps/
  web/      Aplicacao web principal
  mobile/   Estrutura mobile gerada junto ao projeto
config/     Arquivos auxiliares
publisher/  Artefatos gerados pela plataforma original
```

## Variaveis de ambiente

Crie `apps/web/.env.local` em desenvolvimento ou configure as mesmas variaveis no servidor de producao:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/banco?sslmode=require
AUTH_SECRET=gere_um_segredo_forte
BETTER_AUTH_SECRET=gere_um_segredo_forte
AUTH_URL=https://seu-dominio
BETTER_AUTH_URL=https://seu-dominio
NEXT_PUBLIC_AUTH_URL=https://seu-dominio
NEXT_PUBLIC_CREATE_BASE_URL=https://seu-dominio
NEXT_PUBLIC_CREATE_HOST=seu-dominio
NEXT_PUBLIC_PROJECT_GROUP_ID=prontoescala
CORS_ORIGINS=https://seu-dominio
```

Nunca versione arquivos `.env`, senhas, tokens, strings de banco ou enderecos internos.

## Instalacao local

```bash
corepack enable
yarn install
```

## Execucao em desenvolvimento

```bash
yarn workspace web next dev --port 4005
```

## Build de producao

```bash
yarn workspace web build
```

## Execucao em producao

```bash
yarn workspace web start -p 4005
```

Em producao, recomenda-se executar a aplicacao com um gerenciador de processo como PM2 ou dentro de um container Docker, usando um proxy reverso com HTTPS.

## Banco de dados

O sistema utiliza PostgreSQL. As rotas da aplicacao criam ou ajustam algumas tabelas conforme necessario. Entre as tabelas principais estao:

- `medicos`
- `cargos_funcoes`
- `jornadas_trabalho`
- `escalas`
- `checkins`
- `treinamentos`
- `treinamentos_participantes`
- `reunioes`
- `reunioes_participantes`
- tabelas de autenticacao do Better Auth

## Deploy recomendado

1. Configure as variaveis de ambiente no servidor.
2. Clone o repositorio no diretorio da aplicacao.
3. Execute `corepack enable` e `yarn install`.
4. Execute `yarn workspace web build`.
5. Inicie com `yarn workspace web start -p 4005` ou PM2.
6. Configure o proxy reverso apontando o dominio publico para a porta da aplicacao.

## Observacoes de seguranca

- Use HTTPS em producao.
- Use segredos fortes para autenticacao.
- Restrinja o acesso ao banco por usuario e permissao adequados.
- Mantenha backups do banco de dados.
- Evite expor portas internas diretamente para a internet.
