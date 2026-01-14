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
  { code: 'BER', label: 'Berlin, Germany' },
  { code: 'HAM', label: 'Hamburg, Germany' },
  { code: 'DUS', label: 'Düsseldorf, Germany' },
  { code: 'PRG', label: 'Prague, Czech Republic' },
  { code: 'BUD', label: 'Budapest, Hungary' },
  { code: 'WAW', label: 'Warsaw, Poland' },
  { code: 'KRK', label: 'Krakow, Poland' },
  { code: 'ZAG', label: 'Zagreb, Croatia' },
  { code: 'LJU', label: 'Ljubljana, Slovenia' },
  { code: 'SOF', label: 'Sofia, Bulgaria' },
  { code: 'OTP', label: 'Bucharest, Romania' },
  { code: 'SKG', label: 'Thessaloniki, Greece' },
  { code: 'NAP', label: 'Naples, Italy' },
  { code: 'VCE', label: 'Venice, Italy' },
  { code: 'LIN', label: 'Milan (Linate), Italy' },
  { code: 'MAN', label: 'Manchester, UK' },
  { code: 'EDI', label: 'Edinburgh, UK' },
  { code: 'GLA', label: 'Glasgow, UK' },
  { code: 'HEL', label: 'Helsinki, Finland' },
  { code: 'RIX', label: 'Riga, Latvia' },
  { code: 'VNO', label: 'Vilnius, Lithuania' },
  { code: 'TLL', label: 'Tallinn, Estonia' },
  { code: 'SAN', label: 'San Diego, USA' },
  { code: 'SJC', label: 'San Jose, USA' },
  { code: 'OAK', label: 'Oakland, USA' },
  { code: 'TPA', label: 'Tampa, USA' },
  { code: 'FLL', label: 'Fort Lauderdale, USA' },
  { code: 'BWI', label: 'Baltimore, USA' },
  { code: 'DCA', label: 'Washington (Reagan), USA' },
  { code: 'RDU', label: 'Raleigh-Durham, USA' },
  { code: 'PDX', label: 'Portland, USA' },
  { code: 'ANC', label: 'Anchorage, USA' },
  { code: 'YOW', label: 'Ottawa, Canada' },
  { code: 'YHZ', label: 'Halifax, Canada' },
  { code: 'MFM', label: 'Macau' },
  { code: 'ITM', label: 'Osaka (Itami), Japan' },
  { code: 'FUK', label: 'Fukuoka, Japan' },
  { code: 'OKA', label: 'Okinawa, Japan' },
  { code: 'CTS', label: 'Sapporo, Japan' },
  { code: 'SGN', label: 'Ho Chi Minh City, Vietnam' },
  { code: 'HAN', label: 'Hanoi, Vietnam' },
  { code: 'DAD', label: 'Da Nang, Vietnam' },
  { code: 'PNH', label: 'Phnom Penh, Cambodia' },
  { code: 'REP', label: 'Siem Reap, Cambodia' },
  { code: 'ULN', label: 'Ulaanbaatar, Mongolia' },
  { code: 'ALA', label: 'Almaty, Kazakhstan' },
  { code: 'TAS', label: 'Tashkent, Uzbekistan' },
  { code: 'UIO', label: 'Quito, Ecuador' },
  { code: 'GYE', label: 'Guayaquil, Ecuador' },
  { code: 'LPB', label: 'La Paz, Bolivia' },
  { code: 'ASU', label: 'Asunción, Paraguay' },
  { code: 'MVD', label: 'Montevideo, Uruguay' },
  { code: 'SDQ', label: 'Santo Domingo, Dominican Republic' },
  { code: 'HAV', label: 'Havana, Cuba' },
  { code: 'SHJ', label: 'Sharjah, UAE' },
  { code: 'AMM', label: 'Amman, Jordan' },
  { code: 'BEY', label: 'Beirut, Lebanon' },
  { code: 'KWI', label: 'Kuwait City, Kuwait' },
  { code: 'BAH', label: 'Manama, Bahrain' },
  { code: 'ALG', label: 'Algiers, Algeria' },
  { code: 'DKR', label: 'Dakar, Senegal' },
  { code: 'ABJ', label: 'Abidjan, Ivory Coast' },
  { code: 'KGL', label: 'Kigali, Rwanda' },
  { code: 'PMI', label: 'Palma de Mallorca, Spain' },
  { code: 'BLQ', label: 'Bologna, Italy' },
  { code: 'GOT', label: 'Gothenburg, Sweden' },
  { code: 'GVA', label: 'Geneva, Switzerland' },
  { code: 'SNA', label: 'Orange County, USA' },
  { code: 'AUS', label: 'Austin, USA' },
  { code: 'SMF', label: 'Sacramento, USA' },
  { code: 'GMP', label: 'Seoul (Gimpo), South Korea' },
  { code: 'CTU', label: 'Chengdu, China' },
  { code: 'DMK', label: 'Bangkok (Don Mueang), Thailand' },
  { code: 'BRC', label: 'San Carlos de Bariloche, Argentina' },
  { code: 'PUJ', label: 'Punta Cana, Dominican Republic' },
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
