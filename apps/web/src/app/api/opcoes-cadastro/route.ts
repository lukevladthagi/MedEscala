import sql from "@/app/api/utils/sql";

const allowedTypes = new Set([
  "tipo_funcionario",
  "especialidade",
  "setor",
  "tipo_vinculo",
]);

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS opcoes_cadastro (
      id SERIAL PRIMARY KEY,
      tipo TEXT NOT NULL,
      valor TEXT NOT NULL,
      rotulo TEXT NOT NULL,
      is_ativo INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (tipo, valor)
    )
  `;
}

export async function GET(req: Request) {
  await ensureTable();

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");

  if (tipo && !allowedTypes.has(tipo)) {
    return Response.json({ error: "Tipo de opção inválido" }, { status: 400 });
  }

  const rows = tipo
    ? await sql`
        SELECT * FROM opcoes_cadastro
        WHERE tipo = ${tipo} AND is_ativo = 1
        ORDER BY rotulo ASC
      `
    : await sql`
        SELECT * FROM opcoes_cadastro
        WHERE is_ativo = 1
        ORDER BY tipo ASC, rotulo ASC
      `;

  return Response.json(rows || []);
}

export async function POST(req: Request) {
  await ensureTable();

  const body = await req.json();
  const tipo = String(body.tipo || "").trim();
  const valor = String(body.valor || "").trim();
  const rotulo = String(body.rotulo || body.valor || "").trim();

  if (!allowedTypes.has(tipo) || !valor || !rotulo) {
    return Response.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO opcoes_cadastro (tipo, valor, rotulo, is_ativo)
    VALUES (${tipo}, ${valor}, ${rotulo}, 1)
    ON CONFLICT (tipo, valor)
    DO UPDATE SET rotulo = EXCLUDED.rotulo, is_ativo = 1
    RETURNING *
  `;

  return Response.json(rows[0], { status: 201 });
}
