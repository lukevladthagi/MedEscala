import sql from "@/app/api/utils/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const categoria = searchParams.get("categoria");

  let query = "SELECT * FROM treinamentos WHERE 1=1";
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (categoria) {
    params.push(categoria);
    query += ` AND categoria = $${params.length}`;
  }

  query += " ORDER BY data_inicio DESC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO treinamentos (
       titulo, descricao, data_inicio, data_fim, local, instrutor,
       categoria, carga_horaria, vagas_total, is_obrigatorio, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id`,
    [
      body.titulo,
      body.descricao || null,
      body.data_inicio,
      body.data_fim,
      body.local || null,
      body.instrutor || null,
      body.categoria || null,
      body.carga_horaria || null,
      body.vagas_total || null,
      body.is_obrigatorio !== undefined ? body.is_obrigatorio : 0,
      body.status || "agendado",
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
