import sql from "@/app/api/utils/sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM reunioes WHERE id = ${id}`;

  if (!rows[0]) {
    return Response.json({ error: "Reunião não encontrada" }, { status: 404 });
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
    UPDATE reunioes SET
      titulo = ${body.titulo},
      descricao = ${body.descricao || null},
      data_inicio = ${body.data_inicio},
      data_fim = ${body.data_fim},
      local = ${body.local || null},
      organizador = ${body.organizador || null},
      tipo = ${body.tipo || null},
      is_obrigatoria = ${body.is_obrigatoria !== undefined ? body.is_obrigatoria : 0},
      status = ${body.status || "agendada"},
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
  await sql`DELETE FROM reunioes WHERE id = ${id}`;
  return Response.json({ success: true });
}
