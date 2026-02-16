export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://ahhhiqcnnwpfbgdggvct.supabase.co/functions/v1/sitemap"
    );

    if (!response.ok) {
      throw new Error("Gagal ambil sitemap dari Supabase");
    }

    const sitemap = await response.text();

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(sitemap);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error ambil sitemap");
  }
}