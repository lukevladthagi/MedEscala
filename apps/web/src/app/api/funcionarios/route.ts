import sql from "@/app/api/utils/sql";

async function ensureJornadaColumn() {
  await sql`
    CREATE TABLE IF NOT EXISTS jornadas_trabalho (
      id SERIAL PRIMARY KEY,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      flexivel INTEGER NOT NULL DEFAULT 0,
      tipo_escala TEXT NOT NULL,
      is_ativo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`ALTER TABLE medicos ADD COLUMN IF NOT EXISTS jornada_id INTEGER`;
}

// Funcionarios are stored in the shared `medicos` table.
export async function GET(req: Request) {
  await ensureJornadaColumn();

  const { searchParams } = new URL(req.url);
  const ativo = searchParams.get("ativo");
  const setor = searchParams.get("setor");
  const tipo_funcionario = searchParams.get("tipo_funcionario");
  const cargo = searchParams.get("cargo");

  let query = `
    SELECT
      m.*,
      jt.codigo AS jornada_codigo,
      jt.nome AS jornada_nome,
      jt.flexivel AS jornada_flexivel,
      jt.tipo_escala AS jornada_tipo_escala
    FROM medicos m
    LEFT JOIN jornadas_trabalho jt ON jt.id = m.jornada_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (ativo !== null) {
    params.push(ativo === "true" ? 1 : 0);
    query += ` AND m.is_ativo = $${params.length}`;
  }

  if (setor) {
    params.push(setor);
    query += ` AND m.setor = $${params.length}`;
  }

  if (tipo_funcionario) {
    params.push(tipo_funcionario);
    query += ` AND m.tipo_funcionario = $${params.length}`;
  }

  if (cargo) {
    params.push(cargo);
    query += ` AND m.cargo = $${params.length}`;
  }

  query += " ORDER BY m.nome ASC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  await ensureJornadaColumn();
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO medicos (
       nome, cpf, crm, cargo, tipo_funcionario, especialidade, telefone, email,
       telegram_id, is_ativo, unidade_hospitalar, setor, tipo_vinculo,
       data_admissao, data_nascimento, foto_url, coordenador_responsavel, jornada_id
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING id`,
    [
      body.nome,
      body.cpf || null,
      body.crm || "",
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
      body.jornada_id || null,
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
