// Mocha served check-in photos out of an R2 bucket by object key. On Anything,
// uploaded photos are stored as public URLs (see /api/checkin-photo), and the
// import pipeline rewrote any legacy R2 keys/URLs to Anything upload URLs. If a
// caller still hits this route with a full URL, redirect to it; otherwise the
// object is no longer addressable by raw key.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  const decoded = decodeURIComponent((path || []).join("/"));

  if (/^https?:\/\//i.test(decoded)) {
    return Response.redirect(decoded, 302);
  }

  return Response.json({ error: "Foto não encontrada" }, { status: 404 });
}
