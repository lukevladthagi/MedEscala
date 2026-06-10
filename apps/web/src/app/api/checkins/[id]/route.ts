import sql from "@/app/api/utils/sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await sql`
    SELECT c.*, m.nome as medico_nome, m.crm as medico_crm,
           e.data_inicio as escala_inicio, e.data_fim as escala_fim, e.setor
    FROM checkins c
    LEFT JOIN medicos m ON c.medico_id = m.id
    LEFT JOIN escalas e ON c.escala_id = e.id
    WHERE c.id = ${id}
  `;

  if (!rows[0]) {
    return Response.json({ error: "Check-in não encontrado" }, { status: 404 });
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
    UPDATE checkins SET
      medico_id = ${body.medico_id},
      escala_id = ${body.escala_id || null},
      data_hora = ${body.data_hora},
      latitude = ${body.latitude || null},
      longitude = ${body.longitude || null},
      distancia_hospital = ${body.distancia_hospital || null},
      metodo_checkin = ${body.metodo_checkin || "manual"},
      is_valido = ${body.is_valido !== undefined ? body.is_valido : 1},
      is_no_prazo = ${body.is_no_prazo !== undefined ? body.is_no_prazo : 1},
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
  await sql`DELETE FROM checkins WHERE id = ${id}`;
  return Response.json({ success: true });
}
