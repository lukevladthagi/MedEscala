import sql from "@/app/api/utils/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ativo = searchParams.get("ativo");
  const tipo_vinculo = searchParams.get("tipo_vinculo");

  let query = "SELECT * FROM cargos_funcoes WHERE 1=1";
  const params: unknown[] = [];

  if (ativo !== null) {
    params.push(ativo === "true" ? 1 : 0);
    query += ` AND is_ativo = $${params.length}`;
  }

  if (tipo_vinculo) {
    params.push(tipo_vinculo);
    query += ` AND tipo_vinculo = $${params.length}`;
  }

  query += " ORDER BY nome ASC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO cargos_funcoes (
       nome, tipo_vinculo, descricao, horas_diarias_max, horas_semanais_max,
       horas_mensais_max, dias_consecutivos_max, horas_descanso_minimo,
       permite_sobreaviso, permite_hora_extra, limite_hora_extra_mensal,
       intervalo_intrajornada_minimo, dias_folga_semana, observacoes, is_ativo
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id`,
    [
      body.nome,
      body.tipo_vinculo || null,
      body.descricao || null,
      body.horas_diarias_max || null,
      body.horas_semanais_max || null,
      body.horas_mensais_max || null,
      body.dias_consecutivos_max || null,
      body.horas_descanso_minimo || null,
      body.permite_sobreaviso || 0,
      body.permite_hora_extra !== undefined ? body.permite_hora_extra : 1,
      body.limite_hora_extra_mensal || null,
      body.intervalo_intrajornada_minimo || null,
      body.dias_folga_semana || 1,
      body.observacoes || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
