import sql from "@/app/api/utils/sql";

async function ensureEscalaSlotsSchema() {
  await sql`ALTER TABLE escalas ALTER COLUMN medico_id DROP NOT NULL`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureEscalaSlotsSchema();
  const { id } = await params;
  const body = await req.json();
  const medicoId = Number(body.medico_id);

  if (!medicoId) {
    return Response.json({ error: "Selecione um médico para assumir a vaga." }, { status: 400 });
  }

  const escalaRows = await sql`
    SELECT id, medico_id, data_inicio, data_fim, status
    FROM escalas
    WHERE id = ${id}
    LIMIT 1
  `;
  const escala = escalaRows[0];

  if (!escala) {
    return Response.json({ error: "Vaga não encontrada." }, { status: 404 });
  }

  if (escala.medico_id) {
    return Response.json({ error: "Este horário já foi ocupado por outro médico." }, { status: 409 });
  }

  if (String(escala.status || "") === "cancelada") {
    return Response.json({ error: "Esta vaga está cancelada." }, { status: 409 });
  }

  const conflictRows = await sql`
    SELECT id, data_inicio, data_fim, setor
    FROM escalas
    WHERE medico_id = ${medicoId}
      AND status <> 'cancelada'
      AND id <> ${id}
      AND data_inicio::timestamp < ${escala.data_fim}::timestamp
      AND data_fim::timestamp > ${escala.data_inicio}::timestamp
    LIMIT 1
  `;

  if (conflictRows.length > 0) {
    return Response.json(
      {
        error: "Este médico já possui outro horário sobreposto.",
        conflict: conflictRows[0],
      },
      { status: 409 },
    );
  }

  const updated = await sql`
    UPDATE escalas
    SET medico_id = ${medicoId},
        updated_at = CURRENT_TIMESTAMP::text
    WHERE id = ${id}
      AND medico_id IS NULL
    RETURNING *
  `;

  if (!updated[0]) {
    return Response.json({ error: "Este horário acabou de ser ocupado. Atualize a tela." }, { status: 409 });
  }

  return Response.json({ success: true, escala: updated[0] });
}
