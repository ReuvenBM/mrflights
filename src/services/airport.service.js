// src/services/airport.service.js

export const AIRPORT_OPTIONS = [
  { code: 'TLV', label: 'Tel Aviv, Israel' },
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
  { code: 'SFO', label: 'San Francisco, USA' },
  { code: 'ORD', label: "Chicago (O'Hare), USA" },
  { code: 'ATL', label: 'Atlanta, USA' },
  { code: 'DFW', label: 'Dallas/Fort Worth, USA' },
  { code: 'MIA', label: 'Miami, USA' },
  { code: 'BOS', label: 'Boston, USA' },
  { code: 'SEA', label: 'Seattle, USA' },
  { code: 'DEN', label: 'Denver, USA' },
  { code: 'LAS', label: 'Las Vegas, USA' },
  { code: 'YYZ', label: 'Toronto, Canada' },
  { code: 'YUL', label: 'Montreal, Canada' },
  { code: 'DUB', label: 'Dublin, Ireland' },
  { code: 'LIS', label: 'Lisbon, Portugal' },
  { code: 'OPO', label: 'Porto, Portugal' },
  { code: 'BRU', label: 'Brussels, Belgium' },
  { code: 'VIE', label: 'Vienna, Austria' },
  { code: 'ARN', label: 'Stockholm, Sweden' },
  { code: 'CPH', label: 'Copenhagen, Denmark' },
  { code: 'OSL', label: 'Oslo, Norway' },
  { code: 'HKG', label: 'Hong Kong' },
  { code: 'SYD', label: 'Sydney, Australia' },
  { code: 'MEL', label: 'Melbourne, Australia' },
  { code: 'PVG', label: 'Shanghai (Pudong), China' },
  { code: 'PEK', label: 'Beijing (Capital), China' },
  { code: 'CAN', label: 'Guangzhou, China' },
  { code: 'SZX', label: 'Shenzhen, China' },
  { code: 'TPE', label: 'Taipei, Taiwan' },
  { code: 'KUL', label: 'Kuala Lumpur, Malaysia' },
  { code: 'CGK', label: 'Jakarta, Indonesia' },
  { code: 'DPS', label: 'Bali (Denpasar), Indonesia' },
  { code: 'MNL', label: 'Manila, Philippines' },
  { code: 'DEL', label: 'Delhi, India' },
  { code: 'BOM', label: 'Mumbai, India' },
  { code: 'BLR', label: 'Bangalore, India' },
  { code: 'HYD', label: 'Hyderabad, India' },
  { code: 'MAA', label: 'Chennai, India' },
  { code: 'RUH', label: 'Riyadh, Saudi Arabia' },
  { code: 'JED', label: 'Jeddah, Saudi Arabia' },
  { code: 'IAH', label: 'Houston, USA' },
  { code: 'PHX', label: 'Phoenix, USA' },
  { code: 'MCO', label: 'Orlando, USA' },
  { code: 'IAD', label: 'Washington Dulles, USA' },
  { code: 'PHL', label: 'Philadelphia, USA' },
  { code: 'MSP', label: 'Minneapolis, USA' },
  { code: 'SLC', label: 'Salt Lake City, USA' },
  { code: 'CLT', label: 'Charlotte, USA' },
  { code: 'DTW', label: 'Detroit, USA' },
  { code: 'YVR', label: 'Vancouver, Canada' },
  { code: 'YYC', label: 'Calgary, Canada' },
  { code: 'MEX', label: 'Mexico City, Mexico' },
  { code: 'CUN', label: 'Cancun, Mexico' },
  { code: 'GDL', label: 'Guadalajara, Mexico' },
  { code: 'PTY', label: 'Panama City, Panama' },
  { code: 'SJO', label: 'San Jose, Costa Rica' },
  { code: 'BOG', label: 'Bogota, Colombia' },
  { code: 'MDE', label: 'Medellin, Colombia' },
  { code: 'LIM', label: 'Lima, Peru' },
  { code: 'SCL', label: 'Santiago, Chile' },
  { code: 'EZE', label: 'Buenos Aires, Argentina' },
  { code: 'GRU', label: 'Sao Paulo, Brazil' },
  { code: 'GIG', label: 'Rio de Janeiro, Brazil' },
  { code: 'CAI', label: 'Cairo, Egypt' },
  { code: 'CMN', label: 'Casablanca, Morocco' },
  { code: 'RAK', label: 'Marrakesh, Morocco' },
  { code: 'TUN', label: 'Tunis, Tunisia' },
  { code: 'NBO', label: 'Nairobi, Kenya' },
  { code: 'ADD', label: 'Addis Ababa, Ethiopia' },
  { code: 'JNB', label: 'Johannesburg, South Africa' },
  { code: 'CPT', label: 'Cape Town, South Africa' },
  { code: 'LOS', label: 'Lagos, Nigeria' },
  { code: 'ACC', label: 'Accra, Ghana' },
  { code: 'DAR', label: 'Dar es Salaam, Tanzania' },
  { code: 'MRU', label: 'Mauritius' },
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
