import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabase = createClient(
    'https://ahhhiqcnnwpfbgdggvct.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaGhpcWNubndwZmJnZGdndmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTIzNjIsImV4cCI6MjA4MTI4ODM2Mn0.Yu8ZKrBf549dQ78BuOROaim1B0zR74cBVRPNKPm7Cu0'
  )

  try {
    const { data, error } = await supabase
      .from('sitemap') // ganti dengan nama tabel kamu
      .select('*')

    if (error) throw error

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${data.map(item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.updated_at || new Date().toISOString()}</lastmod>
    <changefreq>${item.changefreq || 'weekly'}</changefreq>
    <priority>${item.priority || '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    res.status(200).send(sitemap)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}