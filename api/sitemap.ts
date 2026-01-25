export default async function handler(req, res) {
  const r = await fetch(
    "https://ahhhiqcnnwpfbgdggvct.supabase.co/functions/v1/sitemap",
    { cache: "no-store" }
  );

  const xml = await r.text();

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).send(xml);
}