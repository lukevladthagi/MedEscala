import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

// ========== AUTH ENDPOINTS ==========

// Get OAuth redirect URL for Google login
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

// Exchange authorization code for session token
app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

// Get current authenticated user
app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

// Logout user
app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// GET all doctors with optional filters
app.get("/api/medicos", async (c) => {
  const db = c.env.DB;
  const { search, especialidade, setor, ativo } = c.req.query();

  let query = "SELECT * FROM medicos WHERE 1=1";
  const params: any[] = [];

  if (search) {
    query += " AND (nome LIKE ? OR crm LIKE ? OR email LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  if (especialidade) {
    query += " AND especialidade = ?";
    params.push(especialidade);
  }

  if (setor) {
    query += " AND setor = ?";
    params.push(setor);
  }

  if (ativo !== undefined) {
    query += " AND is_ativo = ?";
    params.push(ativo === "true" ? 1 : 0);
  }

  query += " ORDER BY nome ASC";

  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results || []);
});

// GET single doctor by ID
app.get("/api/medicos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare("SELECT * FROM medicos WHERE id = ?")
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Médico não encontrado" }, 404);
  }

  return c.json(result);
});

// POST create new doctor
app.post("/api/medicos", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO medicos (
        nome, crm, especialidade, telefone, telegram_id, is_ativo,
        unidade_hospitalar, setor, tipo_vinculo, foto_url,
        coordenador_responsavel, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.nome,
      body.crm,
      body.especialidade || null,
      body.telefone || null,
      body.telegram_id || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
      body.unidade_hospitalar || null,
      body.setor || null,
      body.tipo_vinculo || null,
      body.foto_url || null,
      body.coordenador_responsavel || null,
      body.email || null
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update doctor
app.put("/api/medicos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE medicos SET
        nome = ?, crm = ?, especialidade = ?, telefone = ?,
        telegram_id = ?, is_ativo = ?, unidade_hospitalar = ?,
        setor = ?, tipo_vinculo = ?, foto_url = ?,
        coordenador_responsavel = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.nome,
      body.crm,
      body.especialidade || null,
      body.telefone || null,
      body.telegram_id || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
      body.unidade_hospitalar || null,
      body.setor || null,
      body.tipo_vinculo || null,
      body.foto_url || null,
      body.coordenador_responsavel || null,
      body.email || null,
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE doctor
app.delete("/api/medicos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM medicos WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// GET unique specialties
app.get("/api/especialidades", async (c) => {
  const db = c.env.DB;
  const result = await db
    .prepare("SELECT DISTINCT especialidade FROM medicos WHERE especialidade IS NOT NULL ORDER BY especialidade")
    .all();
  return c.json(result.results || []);
});

// GET unique cargos (from medicos table for backwards compatibility)
app.get("/api/cargos", async (c) => {
  const db = c.env.DB;
  const result = await db
    .prepare("SELECT DISTINCT cargo FROM medicos WHERE cargo IS NOT NULL ORDER BY cargo")
    .all();
  return c.json(result.results || []);
});

// ========== CARGOS E FUNÇÕES ENDPOINTS ==========

// GET all cargos-funcoes
app.get("/api/cargos-funcoes", async (c) => {
  const db = c.env.DB;
  const { ativo, tipo_vinculo } = c.req.query();

  let query = "SELECT * FROM cargos_funcoes WHERE 1=1";
  const params: any[] = [];

  if (ativo !== undefined) {
    query += " AND is_ativo = ?";
    params.push(ativo === "true" ? 1 : 0);
  }

  if (tipo_vinculo) {
    query += " AND tipo_vinculo = ?";
    params.push(tipo_vinculo);
  }

  query += " ORDER BY nome ASC";

  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results || []);
});

// GET single cargo-funcao by ID
app.get("/api/cargos-funcoes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare("SELECT * FROM cargos_funcoes WHERE id = ?")
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Cargo não encontrado" }, 404);
  }

  return c.json(result);
});

// POST create new cargo-funcao
app.post("/api/cargos-funcoes", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO cargos_funcoes (
        nome, tipo_vinculo, descricao, horas_diarias_max, horas_semanais_max,
        horas_mensais_max, dias_consecutivos_max, horas_descanso_minimo,
        permite_sobreaviso, permite_hora_extra, limite_hora_extra_mensal,
        intervalo_intrajornada_minimo, dias_folga_semana, observacoes, is_ativo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.nome,
      body.tipo_vinculo || null,
      body.descricao || null,
      body.horas_diarias_max || null,
      body.horas_semanais_max || null,
      body.horas_mensais_max || null,
      body.dias_consecutivos_max || null,
      body.horas_descanso_minimo || null,
      body.permite_sobreaviso || 0,
      body.permite_hora_extra !== undefined ? body.permite_hora_extra : 1,
      body.limite_hora_extra_mensal || null,
      body.intervalo_intrajornada_minimo || null,
      body.dias_folga_semana || 1,
      body.observacoes || null,
      body.is_ativo !== undefined ? body.is_ativo : 1
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update cargo-funcao
app.put("/api/cargos-funcoes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE cargos_funcoes SET
        nome = ?, tipo_vinculo = ?, descricao = ?, horas_diarias_max = ?,
        horas_semanais_max = ?, horas_mensais_max = ?, dias_consecutivos_max = ?,
        horas_descanso_minimo = ?, permite_sobreaviso = ?, permite_hora_extra = ?,
        limite_hora_extra_mensal = ?, intervalo_intrajornada_minimo = ?,
        dias_folga_semana = ?, observacoes = ?, is_ativo = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.nome,
      body.tipo_vinculo || null,
      body.descricao || null,
      body.horas_diarias_max || null,
      body.horas_semanais_max || null,
      body.horas_mensais_max || null,
      body.dias_consecutivos_max || null,
      body.horas_descanso_minimo || null,
      body.permite_sobreaviso || 0,
      body.permite_hora_extra !== undefined ? body.permite_hora_extra : 1,
      body.limite_hora_extra_mensal || null,
      body.intervalo_intrajornada_minimo || null,
      body.dias_folga_semana || 1,
      body.observacoes || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE cargo-funcao
app.delete("/api/cargos-funcoes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM cargos_funcoes WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// ========== FUNCIONARIOS ENDPOINTS ==========

// GET all funcionarios with optional filters
app.get("/api/funcionarios", async (c) => {
  const db = c.env.DB;
  const { ativo, setor, tipo_funcionario, cargo } = c.req.query();

  let query = "SELECT * FROM medicos WHERE 1=1";
  const params: any[] = [];

  if (ativo !== undefined) {
    query += " AND is_ativo = ?";
    params.push(ativo === "true" ? 1 : 0);
  }

  if (setor) {
    query += " AND setor = ?";
    params.push(setor);
  }

  if (tipo_funcionario) {
    query += " AND tipo_funcionario = ?";
    params.push(tipo_funcionario);
  }

  if (cargo) {
    query += " AND cargo = ?";
    params.push(cargo);
  }

  query += " ORDER BY nome ASC";

  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results || []);
});

// GET single funcionario by ID
app.get("/api/funcionarios/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare("SELECT * FROM medicos WHERE id = ?")
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Funcionário não encontrado" }, 404);
  }

  return c.json(result);
});

// POST create new funcionario
app.post("/api/funcionarios", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO medicos (
        nome, cpf, crm, cargo, tipo_funcionario, especialidade, telefone, email,
        telegram_id, is_ativo, unidade_hospitalar, setor, tipo_vinculo,
        data_admissao, data_nascimento, foto_url, coordenador_responsavel
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.nome,
      body.cpf || null,
      body.crm || null,
      body.cargo || null,
      body.tipo_funcionario || "medico",
      body.especialidade || null,
      body.telefone || null,
      body.email || null,
      body.telegram_id || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
      body.unidade_hospitalar || null,
      body.setor || null,
      body.tipo_vinculo || null,
      body.data_admissao || null,
      body.data_nascimento || null,
      body.foto_url || null,
      body.coordenador_responsavel || null
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update funcionario
app.put("/api/funcionarios/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE medicos SET
        nome = ?, cpf = ?, crm = ?, cargo = ?, tipo_funcionario = ?, especialidade = ?,
        telefone = ?, email = ?, telegram_id = ?, is_ativo = ?, unidade_hospitalar = ?,
        setor = ?, tipo_vinculo = ?, data_admissao = ?, data_nascimento = ?,
        foto_url = ?, coordenador_responsavel = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.nome,
      body.cpf || null,
      body.crm || null,
      body.cargo || null,
      body.tipo_funcionario || "medico",
      body.especialidade || null,
      body.telefone || null,
      body.email || null,
      body.telegram_id || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
      body.unidade_hospitalar || null,
      body.setor || null,
      body.tipo_vinculo || null,
      body.data_admissao || null,
      body.data_nascimento || null,
      body.foto_url || null,
      body.coordenador_responsavel || null,
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE funcionario
app.delete("/api/funcionarios/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM medicos WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// GET unique sectors
app.get("/api/setores", async (c) => {
  const db = c.env.DB;
  const result = await db
    .prepare("SELECT DISTINCT setor FROM medicos WHERE setor IS NOT NULL ORDER BY setor")
    .all();
  return c.json(result.results || []);
});

// ========== ESCALAS ENDPOINTS ==========

// GET all escalas with optional filters
app.get("/api/escalas", async (c) => {
  const db = c.env.DB;
  const { medico_id, setor, tipo, data_inicio, data_fim, status } = c.req.query();

  let query = `
    SELECT e.*, m.nome as medico_nome, m.crm as medico_crm
    FROM escalas e
    LEFT JOIN medicos m ON e.medico_id = m.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (medico_id) {
    query += " AND e.medico_id = ?";
    params.push(medico_id);
  }

  if (setor) {
    query += " AND e.setor = ?";
    params.push(setor);
  }

  if (tipo) {
    query += " AND e.tipo = ?";
    params.push(tipo);
  }

  if (status) {
    query += " AND e.status = ?";
    params.push(status);
  }

  if (data_inicio && data_fim) {
    query += " AND e.data_inicio >= ? AND e.data_fim <= ?";
    params.push(data_inicio, data_fim);
  }

  query += " ORDER BY e.data_inicio DESC";

  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results || []);
});

// GET single escala by ID
app.get("/api/escalas/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare(`
      SELECT e.*, m.nome as medico_nome, m.crm as medico_crm
      FROM escalas e
      LEFT JOIN medicos m ON e.medico_id = m.id
      WHERE e.id = ?
    `)
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Escala não encontrada" }, 404);
  }

  return c.json(result);
});

// POST create new escala
app.post("/api/escalas", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO escalas (
        medico_id, tipo, data_inicio, data_fim, setor, especialidade,
        tipo_plantao, carga_horaria, observacoes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.medico_id,
      body.tipo || "Plantão",
      body.data_inicio,
      body.data_fim,
      body.setor || null,
      body.especialidade || null,
      body.tipo_plantao || null,
      body.carga_horaria || null,
      body.observacoes || null,
      body.status || "ativa"
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update escala
app.put("/api/escalas/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE escalas SET
        medico_id = ?, tipo = ?, data_inicio = ?, data_fim = ?,
        setor = ?, especialidade = ?, tipo_plantao = ?, carga_horaria = ?,
        observacoes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.medico_id,
      body.tipo || "Plantão",
      body.data_inicio,
      body.data_fim,
      body.setor || null,
      body.especialidade || null,
      body.tipo_plantao || null,
      body.carga_horaria || null,
      body.observacoes || null,
      body.status || "ativa",
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE escala
app.delete("/api/escalas/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM escalas WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// ========== CHECKIN PHOTO UPLOAD ==========

// POST upload checkin photo
app.post("/api/checkin-photo", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  const funcionarioId = formData.get("funcionario_id") as string;

  if (!file) {
    return c.json({ error: "Nenhum arquivo enviado" }, 400);
  }

  const timestamp = Date.now();
  const key = `checkins/${funcionarioId}/${timestamp}_${file.name}`;
  
  const arrayBuffer = await file.arrayBuffer();
  
  await c.env.R2_BUCKET.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type || "image/jpeg"
    }
  });

  const foto_url = `/api/checkin-photos/${encodeURIComponent(key)}`;
  
  return c.json({ foto_url, key });
});

// GET checkin photo
app.get("/api/checkin-photos/*", async (c) => {
  const key = decodeURIComponent(c.req.path.replace("/api/checkin-photos/", ""));
  
  const object = await c.env.R2_BUCKET.get(key);
  
  if (!object) {
    return c.json({ error: "Foto não encontrada" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000");
  
  return c.body(object.body, { headers });
});

// ========== CHECKINS ENDPOINTS ==========

// GET all checkins with optional filters
app.get("/api/checkins", async (c) => {
  const db = c.env.DB;
  const { medico_id, escala_id, data_inicio, data_fim, is_valido } = c.req.query();

  let query = `
    SELECT c.*, m.nome as medico_nome, m.crm as medico_crm,
           e.data_inicio as escala_inicio, e.data_fim as escala_fim, e.setor
    FROM checkins c
    LEFT JOIN medicos m ON c.medico_id = m.id
    LEFT JOIN escalas e ON c.escala_id = e.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (medico_id) {
    query += " AND c.medico_id = ?";
    params.push(medico_id);
  }

  if (escala_id) {
    query += " AND c.escala_id = ?";
    params.push(escala_id);
  }

  if (is_valido !== undefined) {
    query += " AND c.is_valido = ?";
    params.push(is_valido === "true" ? 1 : 0);
  }

  if (data_inicio && data_fim) {
    query += " AND c.data_hora >= ? AND c.data_hora <= ?";
    params.push(data_inicio, data_fim);
  }

  query += " ORDER BY c.data_hora DESC";

  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results || []);
});

// GET single checkin by ID
app.get("/api/checkins/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare(`
      SELECT c.*, m.nome as medico_nome, m.crm as medico_crm,
             e.data_inicio as escala_inicio, e.data_fim as escala_fim, e.setor
      FROM checkins c
      LEFT JOIN medicos m ON c.medico_id = m.id
      LEFT JOIN escalas e ON c.escala_id = e.id
      WHERE c.id = ?
    `)
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Check-in não encontrado" }, 404);
  }

  return c.json(result);
});

// POST create new checkin
app.post("/api/checkins", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO checkins (
        medico_id, escala_id, data_hora, latitude, longitude,
        distancia_hospital, metodo_checkin, is_valido, is_no_prazo, observacoes, foto_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.medico_id,
      body.escala_id || null,
      body.data_hora,
      body.latitude || null,
      body.longitude || null,
      body.distancia_hospital || null,
      body.metodo_checkin || "manual",
      body.is_valido !== undefined ? body.is_valido : 1,
      body.is_no_prazo !== undefined ? body.is_no_prazo : 1,
      body.observacoes || null,
      body.foto_url || null
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update checkin
app.put("/api/checkins/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE checkins SET
        medico_id = ?, escala_id = ?, data_hora = ?, latitude = ?, longitude = ?,
        distancia_hospital = ?, metodo_checkin = ?, is_valido = ?, is_no_prazo = ?,
        observacoes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.medico_id,
      body.escala_id || null,
      body.data_hora,
      body.latitude || null,
      body.longitude || null,
      body.distancia_hospital || null,
      body.metodo_checkin || "manual",
      body.is_valido !== undefined ? body.is_valido : 1,
      body.is_no_prazo !== undefined ? body.is_no_prazo : 1,
      body.observacoes || null,
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE checkin
app.delete("/api/checkins/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM checkins WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// ========== TREINAMENTOS ENDPOINTS ==========

// GET all treinamentos with optional filters
app.get("/api/treinamentos", async (c) => {
  const db = c.env.DB;
  const { status, categoria } = c.req.query();

  let query = "SELECT * FROM treinamentos WHERE 1=1";
  const params: any[] = [];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  if (categoria) {
    query += " AND categoria = ?";
    params.push(categoria);
  }

  query += " ORDER BY data_inicio DESC";

  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results || []);
});

// GET single treinamento by ID
app.get("/api/treinamentos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare("SELECT * FROM treinamentos WHERE id = ?")
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Treinamento não encontrado" }, 404);
  }

  return c.json(result);
});

// POST create new treinamento
app.post("/api/treinamentos", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO treinamentos (
        titulo, descricao, data_inicio, data_fim, local, instrutor,
        categoria, carga_horaria, vagas_total, is_obrigatorio, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.titulo,
      body.descricao || null,
      body.data_inicio,
      body.data_fim,
      body.local || null,
      body.instrutor || null,
      body.categoria || null,
      body.carga_horaria || null,
      body.vagas_total || null,
      body.is_obrigatorio !== undefined ? body.is_obrigatorio : 0,
      body.status || "agendado"
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update treinamento
app.put("/api/treinamentos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE treinamentos SET
        titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ?,
        instrutor = ?, categoria = ?, carga_horaria = ?, vagas_total = ?,
        is_obrigatorio = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.titulo,
      body.descricao || null,
      body.data_inicio,
      body.data_fim,
      body.local || null,
      body.instrutor || null,
      body.categoria || null,
      body.carga_horaria || null,
      body.vagas_total || null,
      body.is_obrigatorio !== undefined ? body.is_obrigatorio : 0,
      body.status || "agendado",
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE treinamento
app.delete("/api/treinamentos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM treinamentos WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// GET participants for a training
app.get("/api/treinamentos/:id/participantes", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare(
      `SELECT tp.*, m.nome as medico_nome, m.crm as medico_crm
       FROM treinamentos_participantes tp
       LEFT JOIN medicos m ON tp.medico_id = m.id
       WHERE tp.treinamento_id = ?
       ORDER BY m.nome ASC`
    )
    .bind(id)
    .all();

  return c.json(result.results || []);
});

// POST add participant to training
app.post("/api/treinamentos/:id/participantes", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO treinamentos_participantes (
        treinamento_id, medico_id, status_confirmacao, is_presente, observacoes
      ) VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      body.medico_id,
      body.status_confirmacao || "pendente",
      body.is_presente || null,
      body.observacoes || null
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update participant
app.put("/api/treinamentos-participantes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE treinamentos_participantes SET
        status_confirmacao = ?, is_presente = ?, metodo_presenca = ?,
        data_hora_presenca = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.status_confirmacao,
      body.is_presente !== undefined ? body.is_presente : null,
      body.metodo_presenca || null,
      body.data_hora_presenca || null,
      body.observacoes || null,
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE participant
app.delete("/api/treinamentos-participantes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM treinamentos_participantes WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// ========== REUNIOES ENDPOINTS ==========

// GET all reunioes with optional filters
app.get("/api/reunioes", async (c) => {
  const db = c.env.DB;
  const { status, tipo } = c.req.query();

  let query = "SELECT * FROM reunioes WHERE 1=1";
  const params: any[] = [];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  if (tipo) {
    query += " AND tipo = ?";
    params.push(tipo);
  }

  query += " ORDER BY data_inicio DESC";

  const result = await db.prepare(query).bind(...params).all();
  return c.json(result.results || []);
});

// GET single reuniao by ID
app.get("/api/reunioes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare("SELECT * FROM reunioes WHERE id = ?")
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Reunião não encontrada" }, 404);
  }

  return c.json(result);
});

// POST create new reuniao
app.post("/api/reunioes", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO reunioes (
        titulo, descricao, data_inicio, data_fim, local, organizador,
        tipo, is_obrigatoria, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      body.titulo,
      body.descricao || null,
      body.data_inicio,
      body.data_fim,
      body.local || null,
      body.organizador || null,
      body.tipo || null,
      body.is_obrigatoria !== undefined ? body.is_obrigatoria : 0,
      body.status || "agendada"
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update reuniao
app.put("/api/reunioes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE reunioes SET
        titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ?,
        organizador = ?, tipo = ?, is_obrigatoria = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.titulo,
      body.descricao || null,
      body.data_inicio,
      body.data_fim,
      body.local || null,
      body.organizador || null,
      body.tipo || null,
      body.is_obrigatoria !== undefined ? body.is_obrigatoria : 0,
      body.status || "agendada",
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE reuniao
app.delete("/api/reunioes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM reunioes WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// GET participants for a meeting
app.get("/api/reunioes/:id/participantes", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const result = await db
    .prepare(
      `SELECT rp.*, m.nome as medico_nome, m.crm as medico_crm
       FROM reunioes_participantes rp
       LEFT JOIN medicos m ON rp.medico_id = m.id
       WHERE rp.reuniao_id = ?
       ORDER BY m.nome ASC`
    )
    .bind(id)
    .all();

  return c.json(result.results || []);
});

// POST add participant to meeting
app.post("/api/reunioes/:id/participantes", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  const result = await db
    .prepare(
      `INSERT INTO reunioes_participantes (
        reuniao_id, medico_id, status_confirmacao, is_presente, observacoes
      ) VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      body.medico_id,
      body.status_confirmacao || "pendente",
      body.is_presente || null,
      body.observacoes || null
    )
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// PUT update meeting participant
app.put("/api/reunioes-participantes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  await db
    .prepare(
      `UPDATE reunioes_participantes SET
        status_confirmacao = ?, is_presente = ?, metodo_presenca = ?,
        data_hora_presenca = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .bind(
      body.status_confirmacao,
      body.is_presente !== undefined ? body.is_presente : null,
      body.metodo_presenca || null,
      body.data_hora_presenca || null,
      body.observacoes || null,
      id
    )
    .run();

  return c.json({ id, ...body });
});

// DELETE meeting participant
app.delete("/api/reunioes-participantes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  await db.prepare("DELETE FROM reunioes_participantes WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

export default app;
