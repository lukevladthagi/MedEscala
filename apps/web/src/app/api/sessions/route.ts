// Mocha exchanged an OAuth authorization code for a session token here and set
// the session cookie. With better-auth the OAuth callback is handled directly
// by /api/auth/callback/<provider>, which sets the session cookie itself, so
// there is no code to exchange from the client. This route is kept for
// backwards compatibility with any client that still posts here.
export async function POST(req: Request) {
  let body: { code?: string } = {};
  try {
    body = await req.json();
  } catch {
    // ignore malformed/empty body
  }

  if (!body.code) {
    return Response.json({ error: "No authorization code provided" }, { status: 400 });
  }

  // The session is established by better-auth's own callback handler; nothing
  // to do server-side here. See notes: legacy Mocha code-exchange flow.
  return Response.json({ success: true }, { status: 200 });
}
