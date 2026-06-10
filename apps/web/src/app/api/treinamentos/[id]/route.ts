import sql from "@/app/api/utils/sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM treinamentos WHERE id = ${id}`;

  if (!rows[0]) {
    return Response.json({ error: "Treinamento não encontrado" }, { status: 404 });
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
    UPDATE treinamentos SET
      titulo = ${body.titulo},
      descricao = ${body.descricao || null},
      data_inicio = ${body.data_inicio},
      data_fim = ${body.data_fim},
      local = ${body.local || null},
      instrutor = ${body.instrutor || null},
      categoria = ${body.categoria || null},
      carga_horaria = ${body.carga_horaria || null},
      vagas_total = ${body.vagas_total || null},
      is_obrigatorio = ${body.is_obrigatorio !== undefined ? body.is_obrigatorio : 0},
      status = ${body.status || "agendado"},
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
  await sql`DELETE FROM treinamentos WHERE id = ${id}`;
  return Response.json({ success: true });
}
