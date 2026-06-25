import sql from "@/app/api/utils/sql";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  await sql`ALTER TABLE treinamentos_participantes ADD COLUMN IF NOT EXISTS metodo_presenca TEXT`;
  await sql`ALTER TABLE treinamentos_participantes ADD COLUMN IF NOT EXISTS data_hora_presenca TEXT`;
  await sql`ALTER TABLE treinamentos_participantes ADD COLUMN IF NOT EXISTS updated_at TEXT`;

  await sql`
    UPDATE treinamentos_participantes SET
      status_confirmacao = ${body.status_confirmacao},
      is_presente = ${body.is_presente !== undefined ? body.is_presente : null},
      metodo_presenca = ${body.metodo_presenca || null},
      data_hora_presenca = ${body.data_hora_presenca || null},
      observacoes = ${body.observacoes || null},
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
  await sql`DELETE FROM treinamentos_participantes WHERE id = ${id}`;
  return Response.json({ success: true });
}
