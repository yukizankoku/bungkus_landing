export default async function handler(req, res) {
  const response = await fetch(
    "https://ahhhiqcnnwpbfqdggvct.supabase.co/functions/v1/sitemap"
  );

  const xml = await response.text();

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(xml);
}