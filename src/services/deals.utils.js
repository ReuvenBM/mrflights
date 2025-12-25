import { airlineNames } from './airline-names'

const airlineNameToCode = Object.entries(airlineNames).reduce((acc, [code, name]) => {
  acc[name.toLowerCase()] = code
  return acc
}, {})

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
  const primaryCarrier = (carriers || '').split(',')[0]?.trim()
  const carrierCode = primaryCarrier
    ? airlineNameToCode[primaryCarrier.toLowerCase()] || primaryCarrier.slice(0, 2)
    : undefined

  const airlineLinks = {
    LY: (o, d, dt) => `https://www.elal.com/flight-search?departure=${o}&arrival=${d}&departureDate=${dt}`,
    TK: (o, d, dt) => `https://www.turkishairlines.com/en-int/flights/booking/?origin=${o}&destination=${d}&departureDate=${dt}`,
    EK: (o, d, dt) => `https://www.emirates.com/booking/search-flight/?from=${o}&to=${d}&departureDate=${dt}`,
    RJ: (o, d, dt) => `https://www.rj.com/en/book?origin=${o}&destination=${d}&departureDate=${dt}&tripType=OW`,
    ET: (o, d, dt) => `https://www.ethiopianairlines.com/booking/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    FZ: (o, d, dt) => `https://www.flydubai.com/en/plan/booking/#/search/${o}-${d}/${dt}`,
    SU: (o, d, dt) => `https://www.aeroflot.com/sb/booking/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    OS: (o, d, dt) => `https://www.austrian.com/en/flight/offer?origin=${o}&destination=${d}&outboundDate=${dt}`,
    LH: (o, d, dt) => `https://www.lufthansa.com/booking/flight-selection?origin=${o}&destination=${d}&outboundDate=${dt}`,
    AF: (o, d, dt) => `https://wwws.airfrance.com/search?from=${o}&to=${d}&date=${dt}`,
    KL: (o, d, dt) => `https://www.klm.com/search?from=${o}&to=${d}&date=${dt}`,
    BA: (o, d, dt) => `https://www.britishairways.com/travel/flight-search/public/en_us?from=${o}&to=${d}&depart=${dt}`,
    QR: (o, d, dt) => `https://www.qatarairways.com/app/booking/flight-selection?fromStation=${o}&toStation=${d}&outboundDate=${dt}`,
    EY: (o, d, dt) => `https://www.etihad.com/en/book/flights?from=${o}&to=${d}&departureDate=${dt}`,
    NH: (o, d, dt) => `https://www.ana.co.jp/en/us/book/flight?departure=${o}&arrival=${d}&departureDate=${dt}`,
    SQ: (o, d, dt) => `https://www.singaporeair.com/en_UK/us/plan-travel/booking?from=${o}&to=${d}&departDate=${dt}`,
    CX: (o, d, dt) => `https://www.cathaypacific.com/cx/en_US/book-a-trip/flights/booking?origin=${o}&destination=${d}&depart-date=${dt}`,
    TG: (o, d, dt) => `https://www.thaiairways.com/en/book-a-flight/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    AI: (o, d, dt) => `https://www.airindia.com/booking/flight-search?from=${o}&to=${d}&departureDate=${dt}`,
    HU: (o, d, dt) => `https://www.hainanairlines.com/US/GB/book-flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    CZ: (o, d, dt) => `https://www.csair.com/en/booking/flight-search?from=${o}&to=${d}&departureDate=${dt}`,
    MU: (o, d, dt) => `https://www.chinaeasternairlines.com/en/booking/flight-search?from=${o}&to=${d}&departureDate=${dt}`,
    '3U': (o, d, dt) => `https://www.sichuanair.com/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    HY: (o, d, dt) => `https://www.uzairways.com/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    AA: (o, d, dt) => `https://www.aa.com/booking/find-flights?tripType=oneway&origin=${o}&destination=${d}&departDate=${dt}`,
    UA: (o, d, dt) => `https://www.united.com/en/us/fsr/choose-flights?f=${o}&t=${d}&d=${dt}&tt=1`,
    DL: (o, d, dt) => `https://www.delta.com/flight-search/search?tripType=ONE_WAY&originCity=${o}&destinationCity=${d}&departureDate=${dt}`,
    WN: (o, d, dt) => `https://www.southwest.com/air/booking/select.html?originationAirportCode=${o}&destinationAirportCode=${d}&departureDate=${dt}`,
    AS: (o, d, dt) => `https://www.alaskaair.com/planbook/shopping?o=${o}&d=${d}&depDate=${dt}&tripType=oneway`,
    B6: (o, d, dt) => `https://www.jetblue.com/booking/flights?from=${o}&to=${d}&depart=${dt}&type=oneway`,
    AC: (o, d, dt) => `https://www.aircanada.com/ca/en/aco/home/app.html#/search?origin=${o}&destination=${d}&departureDate=${dt}&tripType=oneway`,
    WS: (o, d, dt) => `https://www.westjet.com/en-ca/book-trip/select-flights?origin=${o}&destination=${d}&departDate=${dt}`,
    LA: (o, d, dt) => `https://www.latamairlines.com/us/en/flight-booking?origin=${o}&destination=${d}&departure=${dt}`,
    AV: (o, d, dt) => `https://www.avianca.com/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    CM: (o, d, dt) => `https://www.copaair.com/en-us/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    AM: (o, d, dt) => `https://aeromexico.com/en-us/book/flights?departure=${o}&arrival=${d}&date=${dt}`,
    G3: (o, d, dt) => `https://www.voegol.com.br/en/bookings/flight-search?from=${o}&to=${d}&date=${dt}`,
    IB: (o, d, dt) => `https://www.iberia.com/booking/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    UX: (o, d, dt) => `https://www.aireuropa.com/en/flights?from=${o}&to=${d}&departureDate=${dt}`,
    AY: (o, d, dt) => `https://www.finnair.com/en/booking?origin=${o}&destination=${d}&departureDate=${dt}`,
    SK: (o, d, dt) => `https://www.flysas.com/en/booking?origin=${o}&destination=${d}&outDate=${dt}`,
    LO: (o, d, dt) => `https://www.lot.com/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    TP: (o, d, dt) => `https://www.flytap.com/en-pt/plan-book/flights?from=${o}&to=${d}&departing=${dt}`,
    LX: (o, d, dt) => `https://www.swiss.com/us/en/flight-booking/flight-search?origin=${o}&destination=${d}&date=${dt}`,
    SN: (o, d, dt) => `https://www.brusselsairlines.com/en/en/flight-booking/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    A3: (o, d, dt) => `https://en.aegeanair.com/plan/book-a-flight?from=${o}&to=${d}&departure-date=${dt}`,
    EI: (o, d, dt) => `https://www.aerlingus.com/html/booking-search?from=${o}&to=${d}&depDate=${dt}`,
    BT: (o, d, dt) => `https://www.airbaltic.com/en/flights?from=${o}&to=${d}&departureDate=${dt}`,
    VY: (o, d, dt) => `https://www.vueling.com/en/bookings/flights?from=${o}&to=${d}&departureDate=${dt}`,
    U2: (o, d, dt) => `https://www.easyjet.com/en/booking/flights?origin=${o}&destination=${d}&departDate=${dt}`,
    FR: (o, d, dt) => `https://www.ryanair.com/booking/home/en-us?orig=${o}&dest=${d}&dateout=${dt}`,
    DY: (o, d, dt) => `https://www.norwegian.com/en/booking/flight-tickets/select-flight/?D_City=${o}&A_City=${d}&D_Date=${dt}`,
    W6: (o, d, dt) => `https://wizzair.com/en-gb/flights/${o}/${d}/${dt}`,
    PC: (o, d, dt) => `https://www.flypgs.com/en/booking?departure=${o}&arrival=${d}&departureDate=${dt}`,
    QF: (o, d, dt) => `https://www.qantas.com/book/search?origin=${o}&destination=${d}&departing=${dt}`,
    NZ: (o, d, dt) => `https://www.airnewzealand.com/booking/flights?from=${o}&to=${d}&departuredate=${dt}`,
    VA: (o, d, dt) => `https://www.virginaustralia.com/bookings/flight-search?from=${o}&to=${d}&departureDate=${dt}`,
    VS: (o, d, dt) => `https://www.virginatlantic.com/book/flight-search?from=${o}&to=${d}&departureDate=${dt}`,
    JL: (o, d, dt) => `https://www.jal.co.jp/ar/en/book/flights?org=${o}&dst=${d}&depdate=${dt}`,
    KE: (o, d, dt) => `https://www.koreanair.com/us/en/booking/search-flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    OZ: (o, d, dt) => `https://flyasiana.com/C/en/homepage/booking/flight-search?depCity=${o}&arrCity=${d}&depDate=${dt}`,
    VN: (o, d, dt) => `https://www.vietnamairlines.com/us/en/plan-book/booking?dep=${o}&arr=${d}&depdate=${dt}`,
    MH: (o, d, dt) => `https://www.malaysiaairlines.com/my/en/plan-book/book-a-flight.html?origin=${o}&destination=${d}&departureDate=${dt}`,
    GA: (o, d, dt) => `https://www.garuda-indonesia.com/en/garuda-indonesia-flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    BR: (o, d, dt) => `https://booking.evaair.com/flyeva/eva/b2c/booking/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    CI: (o, d, dt) => `https://book.china-airlines.com/ssw/book/schedule-search?org=${o}&dst=${d}&outboundDate=${dt}`,
    WY: (o, d, dt) => `https://www.omanair.com/booking/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    SV: (o, d, dt) => `https://www.saudia.com/booking/flights/search?origin=${o}&destination=${d}&departureDate=${dt}`,
    KU: (o, d, dt) => `https://www.kuwaitairways.com/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    GF: (o, d, dt) => `https://www.gulfair.com/plan-your-trip/flight-search?from=${o}&to=${d}&depart=${dt}`,
    ME: (o, d, dt) => `https://www.mea.com.lb/english/plan-and-book/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    UL: (o, d, dt) => `https://www.srilankan.com/en_uk/plan-and-book/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    SA: (o, d, dt) => `https://www.flysaa.com/manage-bookings/flights?from=${o}&to=${d}&departure=${dt}`,
    MS: (o, d, dt) => `https://www.egyptair.com/en/Plan/Pages/FlightsSearchResult.aspx?ORG=${o}&DST=${d}&DT=${dt}`,
    OK: (o, d, dt) => `https://www.csa.cz/en/booking/flight-search?origin=${o}&destination=${d}&date=${dt}`,
    RO: (o, d, dt) => `https://www.tarom.ro/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    OU: (o, d, dt) => `https://www.croatiaairlines.com/book/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    IZ: (o, d, dt) => `https://www.arkia.com/booking/flights?from=${o}&to=${d}&date=${dt}`,
    '6H': (o, d, dt) => `https://www.israir.co.il/en/booking/flights?from=${o}&to=${d}&departureDate=${dt}`,
    '5C': (o, d, dt) => `https://www.cal-cargo.com/booking?origin=${o}&destination=${d}&departureDate=${dt}`,
    '2U': (o, d, dt) => `https://www.elal.com/flight-search?departure=${o}&arrival=${d}&departureDate=${dt}`,
    U8: (o, d, dt) => `https://www.tusairways.com/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    X7: (o, d, dt) => `https://www.challengairlines.com/booking?origin=${o}&destination=${d}&departureDate=${dt}`,
    AZ: (o, d, dt) => `https://www.itaspa.com/en_gb/booking/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    EW: (o, d, dt) => `https://www.eurowings.com/en/book/flights?from=${o}&to=${d}&departure=${dt}`,
    LS: (o, d, dt) => `https://www.jet2.com/en/flight-search?from=${o}&to=${d}&departure=${dt}`,
    F9: (o, d, dt) => `https://www.flyfrontier.com/booking/search?from=${o}&to=${d}&departDate=${dt}`,
    NK: (o, d, dt) => `https://www.spirit.com/book/flights?from=${o}&to=${d}&departureDate=${dt}`,
    HA: (o, d, dt) => `https://www.hawaiianairlines.com/booking/flights?from=${o}&to=${d}&date=${dt}`,
    TS: (o, d, dt) => `https://www.airtransat.com/en-US/book/flights?from=${o}&to=${d}&departureDate=${dt}`,
    VB: (o, d, dt) => `https://www.vivaaerobus.com/en-us/booking?origin=${o}&destination=${d}&departureDate=${dt}`,
    Y4: (o, d, dt) => `https://www.volaris.com/book/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    AD: (o, d, dt) => `https://www.voeazul.com.br/book/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    AR: (o, d, dt) => `https://www.aerolineas.com.ar/booking/flights?from=${o}&to=${d}&departureDate=${dt}`,
    H2: (o, d, dt) => `https://www.skyairline.com/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    PR: (o, d, dt) => `https://www.philippineairlines.com/en/book/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    AK: (o, d, dt) => `https://www.airasia.com/flight/search?origin=${o}&destination=${d}&departureDate=${dt}`,
    '5J': (o, d, dt) => `https://book.cebupacificair.com/Search?o1=${o}&d1=${d}&dd1=${dt}`,
    KQ: (o, d, dt) => `https://www.kenya-airways.com/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    AT: (o, d, dt) => `https://www.royalairmaroc.com/us-en/plan-book/flight-search?from=${o}&to=${d}&departing=${dt}`,
    TU: (o, d, dt) => `https://www.tunisair.com/en/booking/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    MK: (o, d, dt) => `https://www.airmauritius.com/book/flights?origin=${o}&destination=${d}&departureDate=${dt}`,
    WB: (o, d, dt) => `https://www.rwandair.com/booking/flights?from=${o}&to=${d}&departureDate=${dt}`,
    CA: (o, d, dt) => `https://www.airchina.us/US/GB/book-flight/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
    JQ: (o, d, dt) => `https://www.jetstar.com/au/en/flight-search?origin=${o}&destination=${d}&departureDate=${dt}`,
  }

  const curr = (deal.currency || 'USD').toString().trim()
  const q = `Flights from ${origin} to ${dest} on ${ymd} oneway`
  const gf = `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&curr=${encodeURIComponent(curr)}`

  const links = []

  if (carrierCode && airlineLinks[carrierCode]) {
    links.push({
      url: airlineLinks[carrierCode](origin, dest, ymd),
      label: 'Show in Airline website',
      source: carrierCode,
    })
  }

  links.push({ url: gf, label: 'Show in google flights', source: 'GF' })

  return links
}
