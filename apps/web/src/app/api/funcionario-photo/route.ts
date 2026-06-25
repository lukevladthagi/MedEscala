export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const forward = new FormData();
  forward.append("file", file);

  try {
    const uploadRes = await fetch(new URL("/_create/api/upload", req.url), {
      method: "POST",
      body: forward,
    });

    if (uploadRes.ok) {
      const data = (await uploadRes.json()) as { url: string; mimeType?: string };

      return Response.json({
        foto_url: data.url,
        key: data.url,
        mimeType: data.mimeType ?? null,
      });
    }
  } catch (error) {
    console.warn("Upload endpoint unavailable, using embedded photo fallback.", error);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";
  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;

  return Response.json({
    foto_url: dataUrl,
    key: "embedded-photo",
    mimeType,
  });
}
