import sql from "@/app/api/utils/sql";

export async function GET() {
  const rows = await sql`
    SELECT DISTINCT especialidade FROM medicos
    WHERE especialidade IS NOT NULL
    ORDER BY especialidade
  `;
  return Response.json(rows || []);
}
