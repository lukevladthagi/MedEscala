import sql from "@/app/api/utils/sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
  const { id } = await params;
  const body = await req.json();

  await sql`
    UPDATE escalas SET
      medico_id = ${body.medico_id},
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

  return Response.json({ id, ...body });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await sql`DELETE FROM escalas WHERE id = ${id}`;
  return Response.json({ success: true });
}
