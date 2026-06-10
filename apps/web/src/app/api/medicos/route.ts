import sql from "@/app/api/utils/sql";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const especialidade = searchParams.get("especialidade");
  const setor = searchParams.get("setor");
  const ativo = searchParams.get("ativo");

  let query = "SELECT * FROM medicos WHERE 1=1";
  const params: unknown[] = [];

  if (search) {
    params.push(`%${search}%`);
    const p = `$${params.length}`;
    query += ` AND (nome LIKE ${p} OR crm LIKE ${p} OR email LIKE ${p})`;
  }

  if (especialidade) {
    params.push(especialidade);
    query += ` AND especialidade = $${params.length}`;
  }

  if (setor) {
    params.push(setor);
    query += ` AND setor = $${params.length}`;
  }

  if (ativo !== null) {
    params.push(ativo === "true" ? 1 : 0);
    query += ` AND is_ativo = $${params.length}`;
  }

  query += " ORDER BY nome ASC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO medicos (
       nome, crm, especialidade, telefone, telegram_id, is_ativo,
       unidade_hospitalar, setor, tipo_vinculo, foto_url,
       coordenador_responsavel, email
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [
      body.nome,
      body.crm,
      body.especialidade || null,
      body.telefone || null,
      body.telegram_id || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
      body.unidade_hospitalar || null,
      body.setor || null,
      body.tipo_vinculo || null,
      body.foto_url || null,
      body.coordenador_responsavel || null,
      body.email || null,
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
