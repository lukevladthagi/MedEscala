import sql from "@/app/api/utils/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const medico_id = searchParams.get("medico_id");
  const escala_id = searchParams.get("escala_id");
  const data_inicio = searchParams.get("data_inicio");
  const data_fim = searchParams.get("data_fim");
  const is_valido = searchParams.get("is_valido");

  let query = `
    SELECT c.*, m.nome as medico_nome, m.crm as medico_crm,
           e.data_inicio as escala_inicio, e.data_fim as escala_fim, e.setor
    FROM checkins c
    LEFT JOIN medicos m ON c.medico_id = m.id
    LEFT JOIN escalas e ON c.escala_id = e.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (medico_id) {
    params.push(medico_id);
    query += ` AND c.medico_id = $${params.length}`;
  }

  if (escala_id) {
    params.push(escala_id);
    query += ` AND c.escala_id = $${params.length}`;
  }

  if (is_valido !== null) {
    params.push(is_valido === "true" ? 1 : 0);
    query += ` AND c.is_valido = $${params.length}`;
  }

  if (data_inicio && data_fim) {
    params.push(data_inicio);
    query += ` AND c.data_hora >= $${params.length}`;
    params.push(data_fim);
    query += ` AND c.data_hora <= $${params.length}`;
  }

  query += " ORDER BY c.data_hora DESC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO checkins (
       medico_id, escala_id, data_hora, latitude, longitude,
       distancia_hospital, metodo_checkin, is_valido, is_no_prazo, observacoes, foto_url
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id`,
    [
      body.medico_id,
      body.escala_id || null,
      body.data_hora,
      body.latitude || null,
      body.longitude || null,
      body.distancia_hospital || null,
      body.metodo_checkin || "manual",
      body.is_valido !== undefined ? body.is_valido : 1,
      body.is_no_prazo !== undefined ? body.is_no_prazo : 1,
      body.observacoes || null,
      body.foto_url || null,
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
