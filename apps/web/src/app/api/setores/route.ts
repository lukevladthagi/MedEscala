import sql from "@/app/api/utils/sql";

export async function GET() {
  const rows = await sql`
    SELECT DISTINCT setor FROM medicos
    WHERE setor IS NOT NULL
    ORDER BY setor
  `;
  return Response.json(rows || []);
}
