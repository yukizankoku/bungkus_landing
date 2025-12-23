import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // WAJIB
  )

  const { data, error } = await supabase
    .from('pages') // ganti sesuai tabel kamu
    .select('slug, updated_at')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const urls = data.map(item => `
    <url>
      <loc>https://bungkusin.co.id/${item.slug}</loc>
      <lastmod>${new Date(item.updated_at).toISOString()}</lastmod>
    </url>
  `).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.status(200).send(xml)
}
