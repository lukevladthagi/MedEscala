import { auth } from "@/lib/auth";

// Clears the session. Replaces Mocha's deleteSession + cookie clearing with
// better-auth's signOut, which returns a response that expires the session
// cookie.
export async function GET(req: Request) {
  return auth.api.signOut({ headers: req.headers, asResponse: true });
}
