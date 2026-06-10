import { auth } from "@/lib/auth";

// Returns the currently authenticated user. Replaces Mocha's authMiddleware +
// c.get("user") with better-auth's session lookup.
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(session.user);
}
