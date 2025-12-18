// src/services/airport.service.js

export const AIRPORT_OPTIONS = [
  { code: 'TLV', label: 'Tel Aviv, Israel' },
  { code: 'JRS', label: 'Jerusalem, Israel' },
  { code: 'HFA', label: 'Haifa, Israel' },
  { code: 'ETH', label: 'Eilat (Ramon), Israel' },
  { code: 'LCA', label: 'Larnaca, Cyprus' },
  { code: 'ATH', label: 'Athens, Greece' },
  { code: 'IST', label: 'Istanbul, Turkey' },
  { code: 'SAW', label: 'Istanbul (Sabiha), Turkey' },
  { code: 'DXB', label: 'Dubai, UAE' },
  { code: 'AUH', label: 'Abu Dhabi, UAE' },
  { code: 'DOH', label: 'Doha, Qatar' },
  { code: 'FCO', label: 'Rome, Italy' },
  { code: 'MXP', label: 'Milan, Italy' },
  { code: 'CDG', label: 'Paris, France' },
  { code: 'AMS', label: 'Amsterdam, Netherlands' },
  { code: 'FRA', label: 'Frankfurt, Germany' },
  { code: 'MUC', label: 'Munich, Germany' },
  { code: 'ZRH', label: 'Zurich, Switzerland' },
  { code: 'LHR', label: 'London (Heathrow), UK' },
  { code: 'LGW', label: 'London (Gatwick), UK' },
  { code: 'MAD', label: 'Madrid, Spain' },
  { code: 'BCN', label: 'Barcelona, Spain' },
  { code: 'BKK', label: 'Bangkok, Thailand' },
  { code: 'HKT', label: 'Phuket, Thailand' },
  { code: 'CNX', label: 'Chiang Mai, Thailand' },
  { code: 'SIN', label: 'Singapore' },
  { code: 'HND', label: 'Tokyo (Haneda), Japan' },
  { code: 'NRT', label: 'Tokyo (Narita), Japan' },
  { code: 'KIX', label: 'Osaka (Kansai), Japan' },
  { code: 'ICN', label: 'Seoul (Incheon), South Korea' },
  { code: 'JFK', label: 'New York (JFK), USA' },
  { code: 'EWR', label: 'Newark, USA' },
  { code: 'LAX', label: 'Los Angeles, USA' },
]

export function getAirportOptions() {
  return AIRPORT_OPTIONS
}

export function buildAirportMap(options = AIRPORT_OPTIONS) {
  const map = new Map()
  options.forEach((o) => map.set(String(o.code).toUpperCase(), o))
  return map
}

export function normalizeCodes(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map((x) => String(x).trim()).filter(Boolean)

  if (typeof value === 'string') {
    return (value || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  }

  return []
}

export function serializeCodes(codes) {
  return (codes || [])
    .map((c) => String(c).toUpperCase())
    .filter(Boolean)
    .join(', ')
}

export function filterAirportOptions(query, options = AIRPORT_OPTIONS) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return options

  return options.filter((o) => {
    const code = String(o.code || '').toLowerCase()
    const label = String(o.label || '').toLowerCase()
    return code.includes(q) || label.includes(q)
  })
}

export function codesToChips(codes, byCodeMap) {
  return (codes || [])
    .map((c) => String(c).toUpperCase())
    .filter(Boolean)
    .map((code) => ({ code, label: byCodeMap.get(code)?.label || code }))
}

export function isKnownCode(code, byCodeMap) {
  const upper = String(code || '').toUpperCase()
  return Boolean(upper && byCodeMap.has(upper))
}