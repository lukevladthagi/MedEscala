import sql from "@/app/api/utils/sql";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await sql`
    SELECT rp.*, m.nome as medico_nome, m.crm as medico_crm
    FROM reunioes_participantes rp
    LEFT JOIN medicos m ON rp.medico_id = m.id
    WHERE rp.reuniao_id = ${id}
    ORDER BY m.nome ASC
  `;

  return Response.json(rows || []);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO reunioes_participantes (
       reuniao_id, medico_id, status_confirmacao, is_presente, observacoes
     ) VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [
      id,
      body.medico_id,
      body.status_confirmacao || "pendente",
      body.is_presente || null,
      body.observacoes || null,
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
