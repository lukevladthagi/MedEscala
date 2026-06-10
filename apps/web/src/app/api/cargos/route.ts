import sql from "@/app/api/utils/sql";

export async function GET() {
  const rows = await sql`
    SELECT DISTINCT cargo FROM medicos
    WHERE cargo IS NOT NULL
    ORDER BY cargo
  `;
  return Response.json(rows || []);
}
