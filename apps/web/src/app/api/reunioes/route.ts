import sql from "@/app/api/utils/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tipo = searchParams.get("tipo");

  let query = "SELECT * FROM reunioes WHERE 1=1";
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (tipo) {
    params.push(tipo);
    query += ` AND tipo = $${params.length}`;
  }

  query += " ORDER BY data_inicio DESC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO reunioes (
       titulo, descricao, data_inicio, data_fim, local, organizador,
       tipo, is_obrigatoria, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      body.titulo,
      body.descricao || null,
      body.data_inicio,
      body.data_fim,
      body.local || null,
      body.organizador || null,
      body.tipo || null,
      body.is_obrigatoria !== undefined ? body.is_obrigatoria : 0,
      body.status || "agendada",
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
