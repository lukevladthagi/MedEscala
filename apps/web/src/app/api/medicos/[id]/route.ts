import sql from "@/app/api/utils/sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM medicos WHERE id = ${id}`;

  if (!rows[0]) {
    return Response.json({ error: "Médico não encontrado" }, { status: 404 });
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
    UPDATE medicos SET
      nome = ${body.nome},
      crm = ${body.crm},
      especialidade = ${body.especialidade || null},
      telefone = ${body.telefone || null},
      telegram_id = ${body.telegram_id || null},
      is_ativo = ${body.is_ativo !== undefined ? body.is_ativo : 1},
      unidade_hospitalar = ${body.unidade_hospitalar || null},
      setor = ${body.setor || null},
      tipo_vinculo = ${body.tipo_vinculo || null},
      foto_url = ${body.foto_url || null},
      coordenador_responsavel = ${body.coordenador_responsavel || null},
      email = ${body.email || null},
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
