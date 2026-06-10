import sql from "@/app/api/utils/sql";

// Funcionarios are stored in the shared `medicos` table.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ativo = searchParams.get("ativo");
  const setor = searchParams.get("setor");
  const tipo_funcionario = searchParams.get("tipo_funcionario");
  const cargo = searchParams.get("cargo");

  let query = "SELECT * FROM medicos WHERE 1=1";
  const params: unknown[] = [];

  if (ativo !== null) {
    params.push(ativo === "true" ? 1 : 0);
    query += ` AND is_ativo = $${params.length}`;
  }

  if (setor) {
    params.push(setor);
    query += ` AND setor = $${params.length}`;
  }

  if (tipo_funcionario) {
    params.push(tipo_funcionario);
    query += ` AND tipo_funcionario = $${params.length}`;
  }

  if (cargo) {
    params.push(cargo);
    query += ` AND cargo = $${params.length}`;
  }

  query += " ORDER BY nome ASC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  const body = await req.json();

  const rows = await sql(
    `INSERT INTO medicos (
       nome, cpf, crm, cargo, tipo_funcionario, especialidade, telefone, email,
       telegram_id, is_ativo, unidade_hospitalar, setor, tipo_vinculo,
       data_admissao, data_nascimento, foto_url, coordenador_responsavel
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING id`,
    [
      body.nome,
      body.cpf || null,
      body.crm || null,
      body.cargo || null,
      body.tipo_funcionario || "medico",
      body.especialidade || null,
      body.telefone || null,
      body.email || null,
      body.telegram_id || null,
      body.is_ativo !== undefined ? body.is_ativo : 1,
      body.unidade_hospitalar || null,
      body.setor || null,
      body.tipo_vinculo || null,
      body.data_admissao || null,
      body.data_nascimento || null,
      body.foto_url || null,
      body.coordenador_responsavel || null,
    ],
  );

  return Response.json({ id: rows[0].id, ...body }, { status: 201 });
}
