import sql from "@/app/api/utils/sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM cargos_funcoes WHERE id = ${id}`;

  if (!rows[0]) {
    return Response.json({ error: "Cargo não encontrado" }, { status: 404 });
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
    UPDATE cargos_funcoes SET
      nome = ${body.nome},
      tipo_vinculo = ${body.tipo_vinculo || null},
      descricao = ${body.descricao || null},
      horas_diarias_max = ${body.horas_diarias_max || null},
      horas_semanais_max = ${body.horas_semanais_max || null},
      horas_mensais_max = ${body.horas_mensais_max || null},
      dias_consecutivos_max = ${body.dias_consecutivos_max || null},
      horas_descanso_minimo = ${body.horas_descanso_minimo || null},
      permite_sobreaviso = ${body.permite_sobreaviso || 0},
      permite_hora_extra = ${body.permite_hora_extra !== undefined ? body.permite_hora_extra : 1},
      limite_hora_extra_mensal = ${body.limite_hora_extra_mensal || null},
      intervalo_intrajornada_minimo = ${body.intervalo_intrajornada_minimo || null},
      dias_folga_semana = ${body.dias_folga_semana || 1},
      observacoes = ${body.observacoes || null},
      is_ativo = ${body.is_ativo !== undefined ? body.is_ativo : 1},
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
  await sql`DELETE FROM cargos_funcoes WHERE id = ${id}`;
  return Response.json({ success: true });
}
