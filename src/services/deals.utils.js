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
