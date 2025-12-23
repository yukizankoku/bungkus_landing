export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://PROJECT_ID.supabase.co/storage/v1/object/public/seo/sitemap.xml"
    );

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("SITEMAP ERROR:", error);
    res.status(500).send("Sitemap unavailable");
  }
}