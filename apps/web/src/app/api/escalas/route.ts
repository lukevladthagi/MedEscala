import sql from "@/app/api/utils/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const medico_id = searchParams.get("medico_id");
  const setor = searchParams.get("setor");
  const tipo = searchParams.get("tipo");
  const data_inicio = searchParams.get("data_inicio");
  const data_fim = searchParams.get("data_fim");
  const status = searchParams.get("status");

  let query = `
    SELECT e.*, m.nome as medico_nome, m.crm as medico_crm
    FROM escalas e
    LEFT JOIN medicos m ON e.medico_id = m.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (medico_id) {
    params.push(medico_id);
    query += ` AND e.medico_id = $${params.length}`;
  }

  if (setor) {
    params.push(setor);
    query += ` AND e.setor = $${params.length}`;
  }

  if (tipo) {
    params.push(tipo);
    query += ` AND e.tipo = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND e.status = $${params.length}`;
  }

  if (data_inicio && data_fim) {
    params.push(data_inicio);
    query += ` AND e.data_inicio >= $${params.length}`;
    params.push(data_fim);
    query += ` AND e.data_fim <= $${params.length}`;
  }

  query += " ORDER BY e.data_inicio DESC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO escalas (
       medico_id, tipo, data_inicio, data_fim, setor, especialidade,
       tipo_plantao, carga_horaria, observacoes, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      body.medico_id,
      body.tipo || "Plantão",
      body.data_inicio,
      body.data_fim,
      body.setor || null,
      body.especialidade || null,
      body.tipo_plantao || null,
      body.carga_horaria || null,
      body.observacoes || null,
      body.status || "ativa",
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
