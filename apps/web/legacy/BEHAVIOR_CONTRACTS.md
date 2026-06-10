# Mocha Behavior Contracts

Generated before pass 09 from the original Mocha Worker source. These are
minimum route-preservation contracts that the Hono-to-Next conversion must
satisfy before the import can be considered feature-preserving.

- GET /api/oauth/google/redirect_url -> apps/web/src/app/api/oauth/google/redirect_url/route.ts
  Evidence: `app.get("/api/oauth/google/redirect_url", async (c) => {`
- POST /api/sessions -> apps/web/src/app/api/sessions/route.ts
  Evidence: `app.post("/api/sessions", async (c) => {`
- GET /api/users/me -> apps/web/src/app/api/users/me/route.ts
  Evidence: `app.get("/api/users/me", authMiddleware, async (c) => {`
- GET /api/logout -> apps/web/src/app/api/logout/route.ts
  Evidence: `app.get("/api/logout", async (c) => {`
- GET /api/medicos -> apps/web/src/app/api/medicos/route.ts
  Evidence: `app.get("/api/medicos", async (c) => {`
- GET /api/medicos/:id -> apps/web/src/app/api/medicos/[id]/route.ts
  Evidence: `app.get("/api/medicos/:id", async (c) => {`
- POST /api/medicos -> apps/web/src/app/api/medicos/route.ts
  Evidence: `app.post("/api/medicos", async (c) => {`
- PUT /api/medicos/:id -> apps/web/src/app/api/medicos/[id]/route.ts
  Evidence: `app.put("/api/medicos/:id", async (c) => {`
- DELETE /api/medicos/:id -> apps/web/src/app/api/medicos/[id]/route.ts
  Evidence: `app.delete("/api/medicos/:id", async (c) => {`
- GET /api/especialidades -> apps/web/src/app/api/especialidades/route.ts
  Evidence: `app.get("/api/especialidades", async (c) => {`
- GET /api/cargos -> apps/web/src/app/api/cargos/route.ts
  Evidence: `app.get("/api/cargos", async (c) => {`
- GET /api/cargos-funcoes -> apps/web/src/app/api/cargos-funcoes/route.ts
  Evidence: `app.get("/api/cargos-funcoes", async (c) => {`
- GET /api/cargos-funcoes/:id -> apps/web/src/app/api/cargos-funcoes/[id]/route.ts
  Evidence: `app.get("/api/cargos-funcoes/:id", async (c) => {`
- POST /api/cargos-funcoes -> apps/web/src/app/api/cargos-funcoes/route.ts
  Evidence: `app.post("/api/cargos-funcoes", async (c) => {`
- PUT /api/cargos-funcoes/:id -> apps/web/src/app/api/cargos-funcoes/[id]/route.ts
  Evidence: `app.put("/api/cargos-funcoes/:id", async (c) => {`
- DELETE /api/cargos-funcoes/:id -> apps/web/src/app/api/cargos-funcoes/[id]/route.ts
  Evidence: `app.delete("/api/cargos-funcoes/:id", async (c) => {`
- GET /api/funcionarios -> apps/web/src/app/api/funcionarios/route.ts
  Evidence: `app.get("/api/funcionarios", async (c) => {`
- GET /api/funcionarios/:id -> apps/web/src/app/api/funcionarios/[id]/route.ts
  Evidence: `app.get("/api/funcionarios/:id", async (c) => {`
- POST /api/funcionarios -> apps/web/src/app/api/funcionarios/route.ts
  Evidence: `app.post("/api/funcionarios", async (c) => {`
- PUT /api/funcionarios/:id -> apps/web/src/app/api/funcionarios/[id]/route.ts
  Evidence: `app.put("/api/funcionarios/:id", async (c) => {`
- DELETE /api/funcionarios/:id -> apps/web/src/app/api/funcionarios/[id]/route.ts
  Evidence: `app.delete("/api/funcionarios/:id", async (c) => {`
- GET /api/setores -> apps/web/src/app/api/setores/route.ts
  Evidence: `app.get("/api/setores", async (c) => {`
- GET /api/escalas -> apps/web/src/app/api/escalas/route.ts
  Evidence: `app.get("/api/escalas", async (c) => {`
- GET /api/escalas/:id -> apps/web/src/app/api/escalas/[id]/route.ts
  Evidence: `app.get("/api/escalas/:id", async (c) => {`
- POST /api/escalas -> apps/web/src/app/api/escalas/route.ts
  Evidence: `app.post("/api/escalas", async (c) => {`
- PUT /api/escalas/:id -> apps/web/src/app/api/escalas/[id]/route.ts
  Evidence: `app.put("/api/escalas/:id", async (c) => {`
- DELETE /api/escalas/:id -> apps/web/src/app/api/escalas/[id]/route.ts
  Evidence: `app.delete("/api/escalas/:id", async (c) => {`
- POST /api/checkin-photo -> apps/web/src/app/api/checkin-photo/route.ts
  Evidence: `app.post("/api/checkin-photo", async (c) => {`
- GET /api/checkin-photos/* -> apps/web/src/app/api/checkin-photos/[[...path]]/route.ts
  Evidence: `app.get("/api/checkin-photos/*", async (c) => {`
- GET /api/checkins -> apps/web/src/app/api/checkins/route.ts
  Evidence: `app.get("/api/checkins", async (c) => {`
- GET /api/checkins/:id -> apps/web/src/app/api/checkins/[id]/route.ts
  Evidence: `app.get("/api/checkins/:id", async (c) => {`
- POST /api/checkins -> apps/web/src/app/api/checkins/route.ts
  Evidence: `app.post("/api/checkins", async (c) => {`
- PUT /api/checkins/:id -> apps/web/src/app/api/checkins/[id]/route.ts
  Evidence: `app.put("/api/checkins/:id", async (c) => {`
- DELETE /api/checkins/:id -> apps/web/src/app/api/checkins/[id]/route.ts
  Evidence: `app.delete("/api/checkins/:id", async (c) => {`
- GET /api/treinamentos -> apps/web/src/app/api/treinamentos/route.ts
  Evidence: `app.get("/api/treinamentos", async (c) => {`
- GET /api/treinamentos/:id -> apps/web/src/app/api/treinamentos/[id]/route.ts
  Evidence: `app.get("/api/treinamentos/:id", async (c) => {`
- POST /api/treinamentos -> apps/web/src/app/api/treinamentos/route.ts
  Evidence: `app.post("/api/treinamentos", async (c) => {`
- PUT /api/treinamentos/:id -> apps/web/src/app/api/treinamentos/[id]/route.ts
  Evidence: `app.put("/api/treinamentos/:id", async (c) => {`
- DELETE /api/treinamentos/:id -> apps/web/src/app/api/treinamentos/[id]/route.ts
  Evidence: `app.delete("/api/treinamentos/:id", async (c) => {`
- GET /api/treinamentos/:id/participantes -> apps/web/src/app/api/treinamentos/[id]/participantes/route.ts
  Evidence: `app.get("/api/treinamentos/:id/participantes", async (c) => {`
- POST /api/treinamentos/:id/participantes -> apps/web/src/app/api/treinamentos/[id]/participantes/route.ts
  Evidence: `app.post("/api/treinamentos/:id/participantes", async (c) => {`
- PUT /api/treinamentos-participantes/:id -> apps/web/src/app/api/treinamentos-participantes/[id]/route.ts
  Evidence: `app.put("/api/treinamentos-participantes/:id", async (c) => {`
- DELETE /api/treinamentos-participantes/:id -> apps/web/src/app/api/treinamentos-participantes/[id]/route.ts
  Evidence: `app.delete("/api/treinamentos-participantes/:id", async (c) => {`
- GET /api/reunioes -> apps/web/src/app/api/reunioes/route.ts
  Evidence: `app.get("/api/reunioes", async (c) => {`
- GET /api/reunioes/:id -> apps/web/src/app/api/reunioes/[id]/route.ts
  Evidence: `app.get("/api/reunioes/:id", async (c) => {`
- POST /api/reunioes -> apps/web/src/app/api/reunioes/route.ts
  Evidence: `app.post("/api/reunioes", async (c) => {`
- PUT /api/reunioes/:id -> apps/web/src/app/api/reunioes/[id]/route.ts
  Evidence: `app.put("/api/reunioes/:id", async (c) => {`
- DELETE /api/reunioes/:id -> apps/web/src/app/api/reunioes/[id]/route.ts
  Evidence: `app.delete("/api/reunioes/:id", async (c) => {`
- GET /api/reunioes/:id/participantes -> apps/web/src/app/api/reunioes/[id]/participantes/route.ts
  Evidence: `app.get("/api/reunioes/:id/participantes", async (c) => {`
- POST /api/reunioes/:id/participantes -> apps/web/src/app/api/reunioes/[id]/participantes/route.ts
  Evidence: `app.post("/api/reunioes/:id/participantes", async (c) => {`
- PUT /api/reunioes-participantes/:id -> apps/web/src/app/api/reunioes-participantes/[id]/route.ts
  Evidence: `app.put("/api/reunioes-participantes/:id", async (c) => {`
- DELETE /api/reunioes-participantes/:id -> apps/web/src/app/api/reunioes-participantes/[id]/route.ts
  Evidence: `app.delete("/api/reunioes-participantes/:id", async (c) => {`
