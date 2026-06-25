import sql from "@/app/api/utils/sql";
import { jornadasTrabalhoSeed } from "@/data/jornadasTrabalhoSeed";

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS jornadas_trabalho (
      id SERIAL PRIMARY KEY,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      flexivel INTEGER NOT NULL DEFAULT 0,
      tipo_escala TEXT NOT NULL,
      is_ativo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`ALTER TABLE medicos ADD COLUMN IF NOT EXISTS jornada_id INTEGER`;
}

async function seedIfNeeded() {
  const countRows = await sql`SELECT COUNT(*)::int AS total FROM jornadas_trabalho`;
  if ((countRows[0]?.total || 0) >= jornadasTrabalhoSeed.length) return;

  const params: unknown[] = [];
  const values = jornadasTrabalhoSeed
    .map((jornada) => {
      params.push(jornada.codigo, jornada.nome, jornada.flexivel ? 1 : 0, jornada.tipoEscala, 1);
      const offset = params.length - 4;
      return `($${offset}, $${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    })
    .join(",");

  await sql(
    `
      INSERT INTO jornadas_trabalho (codigo, nome, flexivel, tipo_escala, is_ativo)
      VALUES ${values}
      ON CONFLICT (codigo) DO UPDATE SET
        nome = EXCLUDED.nome,
        flexivel = EXCLUDED.flexivel,
        tipo_escala = EXCLUDED.tipo_escala,
        is_ativo = EXCLUDED.is_ativo,
        updated_at = CURRENT_TIMESTAMP::text
    `,
    params,
  );
}

export async function GET(req: Request) {
  await ensureSchema();
  await seedIfNeeded();

  const { searchParams } = new URL(req.url);
  const ativo = searchParams.get("ativo");
  const search = searchParams.get("search");
  const tipoEscala = searchParams.get("tipo_escala");

  const params: unknown[] = [];
  let query = "SELECT * FROM jornadas_trabalho WHERE 1=1";

  if (ativo !== null) {
    params.push(ativo === "true" ? 1 : 0);
    query += ` AND is_ativo = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (codigo ILIKE $${params.length} OR nome ILIKE $${params.length} OR tipo_escala ILIKE $${params.length})`;
  }

  if (tipoEscala) {
    params.push(tipoEscala);
    query += ` AND tipo_escala = $${params.length}`;
  }

  query += " ORDER BY nome ASC";

  const rows = await sql(query, params);
  return Response.json(rows || []);
}

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json();

  const rows = await sql`
    INSERT INTO jornadas_trabalho (codigo, nome, flexivel, tipo_escala, is_ativo)
    VALUES (
      ${body.codigo},
      ${body.nome},
      ${body.flexivel ? 1 : 0},
      ${body.tipo_escala},
      ${body.is_ativo !== undefined ? body.is_ativo : 1}
    )
    ON CONFLICT (codigo) DO UPDATE SET
      nome = EXCLUDED.nome,
      flexivel = EXCLUDED.flexivel,
      tipo_escala = EXCLUDED.tipo_escala,
      is_ativo = EXCLUDED.is_ativo,
      updated_at = CURRENT_TIMESTAMP::text
    RETURNING *
  `;

  return Response.json(rows[0], { status: 201 });
}
