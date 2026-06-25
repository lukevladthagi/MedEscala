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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureJornadaColumn();
  const { id } = await params;
  const rows = await sql`
    SELECT
      m.*,
      jt.codigo AS jornada_codigo,
      jt.nome AS jornada_nome,
      jt.flexivel AS jornada_flexivel,
      jt.tipo_escala AS jornada_tipo_escala
    FROM medicos m
    LEFT JOIN jornadas_trabalho jt ON jt.id = m.jornada_id
    WHERE m.id = ${id}
  `;

  if (!rows[0]) {
    return Response.json({ error: "Funcionário não encontrado" }, { status: 404 });
  }

  return Response.json(rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureJornadaColumn();
  const { id } = await params;
  const body = await req.json();

  await sql`
    UPDATE medicos SET
      nome = ${body.nome},
      cpf = ${body.cpf || null},
      crm = ${body.crm || ""},
      cargo = ${body.cargo || null},
      tipo_funcionario = ${body.tipo_funcionario || "medico"},
      especialidade = ${body.especialidade || null},
      telefone = ${body.telefone || null},
      email = ${body.email || null},
      telegram_id = ${body.telegram_id || null},
      is_ativo = ${body.is_ativo !== undefined ? body.is_ativo : 1},
      unidade_hospitalar = ${body.unidade_hospitalar || null},
      setor = ${body.setor || null},
      tipo_vinculo = ${body.tipo_vinculo || null},
      data_admissao = ${body.data_admissao || null},
      data_nascimento = ${body.data_nascimento || null},
      foto_url = ${body.foto_url || null},
      coordenador_responsavel = ${body.coordenador_responsavel || null},
      jornada_id = ${body.jornada_id || null},
      updated_at = CURRENT_TIMESTAMP::text
    WHERE id = ${id}
  `;

  return Response.json({ id, ...body });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await sql`DELETE FROM medicos WHERE id = ${id}`;
  return Response.json({ success: true });
}
