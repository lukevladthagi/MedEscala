// Upload a check-in photo. Mocha wrote the file straight to an R2 bucket and
// returned an internal /api/checkin-photos/<key> URL. On Anything we forward
// the file to the platform's internal upload endpoint and persist the returned
// public URL. Callers should store `foto_url` on the check-in row.
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const forward = new FormData();
  forward.append("file", file);

  const uploadRes = await fetch(new URL("/_create/api/upload", req.url), {
    method: "POST",
    body: forward,
  });

  if (!uploadRes.ok) {
    return Response.json({ error: "Falha no upload da foto" }, { status: 502 });
  }

  const data = (await uploadRes.json()) as { url: string; mimeType?: string };

  // Preserve the original response shape (foto_url + key). The public URL is
  // now authoritative, so it doubles as the "key".
  return Response.json({
    foto_url: data.url,
    key: data.url,
    mimeType: data.mimeType ?? null,
  });
}
