export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://ahhhiqcnnwpbfqdggvct.supabase.co/functions/v1/sitemap",
      {
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("SITEMAP ERROR:", error);

    res.status(500).json({
      error: "Sitemap function crashed",
      message: error.message,
    });
  }
}