import sql from "@/app/api/utils/sql";

async function ensureEscalaSlotsSchema() {
  await sql`ALTER TABLE escalas ALTER COLUMN medico_id DROP NOT NULL`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureEscalaSlotsSchema();
  const { id } = await params;
  const rows = await sql`
    SELECT e.*, m.nome as medico_nome, m.crm as medico_crm
    FROM escalas e
    LEFT JOIN medicos m ON e.medico_id = m.id
    WHERE e.id = ${id}
  `;

  if (!rows[0]) {
    return Response.json({ error: "Escala não encontrada" }, { status: 404 });
  }

  return Response.json(rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureEscalaSlotsSchema();
  const { id } = await params;
  const body = await req.json();
  const medicoId = body.medico_id ? Number(body.medico_id) : null;

  await sql`
    UPDATE escalas SET
      medico_id = ${medicoId},
      tipo = ${body.tipo || "Plantão"},
      data_inicio = ${body.data_inicio},
      data_fim = ${body.data_fim},
      setor = ${body.setor || null},
      especialidade = ${body.especialidade || null},
      tipo_plantao = ${body.tipo_plantao || null},
      carga_horaria = ${body.carga_horaria || null},
      observacoes = ${body.observacoes || null},
      status = ${body.status || "ativa"},
      updated_at = CURRENT_TIMESTAMP::text
    WHERE id = ${id}
  `;

  return Response.json({ id, ...body, medico_id: medicoId });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureEscalaSlotsSchema();
  const { id } = await params;
  await sql`DELETE FROM escalas WHERE id = ${id}`;
  return Response.json({ success: true });
}
