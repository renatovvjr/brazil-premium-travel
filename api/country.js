export default function handler(request, response) {
  const rawCountry = request.headers['x-vercel-ip-country'] || request.geo?.country || ''
  const country = /^[A-Za-z]{2}$/.test(rawCountry) ? rawCountry.toUpperCase() : null

  response.setHeader('Cache-Control', 'private, no-store, max-age=0')
  response.setHeader('Vary', 'X-Vercel-IP-Country')
  response.status(200).json({ country })
}
