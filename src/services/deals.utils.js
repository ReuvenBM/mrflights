export function parseList(v) {
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    return (v || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  }
  return []
}

export function generateDatesBetween(start, end) {
  const out = []
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s) || isNaN(e) || s > e) return out
  const cur = new Date(s)
  while (cur <= e) {
    const iso = cur.toISOString().slice(0, 10)
    out.push(iso)
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export function filterDeals(list, prefs) {
  if (!Array.isArray(list)) return []
  return list.filter((d) => isMatch(d, prefs))
}

export function isMatch(deal, prefs) {
  if (!deal) return false
  const stops = Number.isFinite(deal.stops) ? deal.stops : (deal.nonStop ? 0 : undefined)
  const price = Number(deal.price)
  const durationH = Number.isFinite(deal.durationMins) ? deal.durationMins / 60 : undefined

  if (stops === 0 && prefs.maxNonstop && price > prefs.maxNonstop) return false
  if (stops === 1 && prefs.maxOnestop && price > prefs.maxOnestop) return false
  if (durationH && prefs.maxHours && durationH > prefs.maxHours) return false
  return true
}

export function safeText(val) {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'object') return formatVal(val)
  return String(val)
}

export function dealDate(d) {
  if (!d) return '—'
  if (typeof d.date === 'string') return d.date
  if (typeof d.dep === 'string') return d.dep.slice(0, 10)
  return '—'
}

export function formatVal(val) {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val)
    } catch (err) {
      return '[object]'
    }
  }
  return String(val)
}
// Build a smart outbound link for a specific flight deal
// Tries airline direct search, falls back to Google Flights
export function buildFlightLink(deal) {
  if (!deal) return null

  const { origin, dest, date, carriers } = deal
  if (!origin || !dest || !date) return null

  const ymd = String(date).slice(0, 10)

  // Infer primary carrier code (first two-letter code)
  const carrierCode = (carriers || '').split(',')[0]?.trim()?.slice(0, 2)

  const airlineLinks = {
    LY: (o, d, dt) =>
      `https://www.elal.com/flight-search?departure=${o}&arrival=${d}&departureDate=${dt}`,
    TK: (o, d, dt) =>
      `https://www.turkishairlines.com/en-int/flights/booking/?origin=${o}&destination=${d}&departureDate=${dt}`,
    EK: (o, d, dt) =>
      `https://www.emirates.com/booking/search-flight/?from=${o}&to=${d}&departureDate=${dt}`,
    QR: (o, d, dt) =>
      `https://www.qatarairways.com/app/booking/flight-selection?fromStation=${o}&toStation=${d}&outboundDate=${dt}`,
    LH: (o, d, dt) =>
      `https://www.lufthansa.com/booking/flight-selection?origin=${o}&destination=${d}&outboundDate=${dt}`,
    AF: (o, d, dt) =>
      `https://wwws.airfrance.co.il/search?from=${o}&to=${d}&date=${dt}`,
    KL: (o, d, dt) =>
      `https://www.klm.co.il/search?from=${o}&to=${d}&date=${dt}`,
  }

  if (carrierCode && airlineLinks[carrierCode]) {
    return {
      url: airlineLinks[carrierCode](origin, dest, ymd),
      label: 'Continue on Airline site',
      source: carrierCode,
    }
  }

  const curr = (deal.currency || 'USD').toString().trim()
  const q = `Flights from ${origin} to ${dest} on ${ymd} oneway`
  const gf = `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&curr=${encodeURIComponent(curr)}`
  return { url: gf, label: 'Show in google flights', source: 'GF' }
}