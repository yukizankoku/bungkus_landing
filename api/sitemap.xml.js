export default async function handler(req, res) {
  try {
    // Panggil Edge Function yang sudah kamu buat di Supabase
    const response = await fetch(
      'https://ahhhiqcnnwpfbgdggvct.supabase.co/functions/v1/sitemap',
      {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaGhpcWNubndwZmJnZGdndmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTIzNjIsImV4cCI6MjA4MTI4ODM2Mn0.Yu8ZKrBf549dQ78BuOROaim1B0zR74cBVRPNKPm7Cu0`
        }
      }
    )

    const xmlData = await response.text()

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.status(200).send(xmlData)
  } catch (error) {
    console.error('Sitemap error:', error)
    res.status(500).json({ error: 'Failed to fetch sitemap' })
  }
}