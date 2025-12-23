export default async function handler(req, res) {
  const sitemapUrl = "https://ahhhiqcnnwpfbgdggvct.supabase.co/storage/v1/object/public/seo/sitemap.xml";

  const response = await fetch(sitemapUrl);
  const xml = await response.text();

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(xml);
}