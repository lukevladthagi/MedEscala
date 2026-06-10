import { auth } from "@/lib/auth";

// Returns the URL the client should redirect to in order to start the Google
// OAuth flow. Mocha's getOAuthRedirectUrl is replaced by better-auth's
// social sign-in, which builds the provider authorization URL for us.
export async function GET(req: Request) {
  const result: { url?: string | null } = await auth.api.signInSocial({
    body: { provider: "google", callbackURL: "/" },
    headers: req.headers,
  });

  return Response.json({ redirectUrl: result?.url ?? null });
}
