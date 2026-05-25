import { useState } from 'react'
import { AIRPORT_OPTIONS, buildAirportMap } from '../services/airport.service'
import { buildGoogleFlightsLink } from '../services/deals.utils'
import { airlineNames } from '../services/airline-names'

const airportByCode = buildAirportMap(AIRPORT_OPTIONS)

const formatAirportLabel = (code) => {
  const raw = String(code || '').trim()
  if (!raw) return ''
  const upper = raw.toUpperCase()
  const airport = airportByCode.get(upper)
  if (!airport) return raw
  return `${airport.label} (${upper})`
}

const formatDateRangeItem = (start, end) => (start === end ? start : `${start} – ${end}`)

const formatCarriers = (carriers, fallback = '—') => {
  if (!carriers) return fallback
  const list = Array.isArray(carriers)
    ? carriers
    : String(carriers)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

  if (!list.length) return fallback

  const uniqueItems = []
  const seen = new Set()

  list.forEach((item) => {
    const raw = String(item || '').trim()
    if (!raw) return
    const key = raw.toUpperCase()
    if (seen.has(key)) return
    seen.add(key)
    uniqueItems.push(raw)
  })

  if (!uniqueItems.length) return fallback

  return uniqueItems
    .map((item) => airlineNames[item] || airlineNames[item.toUpperCase()] || item)
    .join(', ')
}

const firstValue = (values) => values.find((value) => {
  if (Array.isArray(value)) return value.length
  return String(value || '').trim()
})

const collectNestedCarrierCodes = (option) => {
  const codes = []
  const legs = Array.isArray(option?.legs) ? option.legs : []
  const itineraries = Array.isArray(option?.itineraries) ? option.itineraries : []

  legs.forEach((leg) => {
    const legCarrier = firstValue([
      leg?.carrier,
      leg?.carrierCode,
      leg?.airline,
      leg?.airlineCode,
    ])
    if (legCarrier) codes.push(legCarrier)

    const segments = Array.isArray(leg?.segments) ? leg.segments : []
    segments.forEach((segment) => {
      const segmentCarrier = firstValue([
        segment?.carrier,
        segment?.carrierCode,
        segment?.airline,
        segment?.airlineCode,
      ])
      if (segmentCarrier) codes.push(segmentCarrier)
    })
  })

  itineraries.forEach((itinerary) => {
    const segments = Array.isArray(itinerary?.segments) ? itinerary.segments : []
    segments.forEach((segment) => {
      const segmentCarrier = firstValue([
        segment?.carrier,
        segment?.carrierCode,
        segment?.carrier_code,
        segment?.airline,
        segment?.airlineCode,
        segment?.airline_code,
        segment?.marketing_carrier?.iata_code,
        segment?.operating_carrier?.iata_code,
      ])
      if (segmentCarrier) codes.push(segmentCarrier)
    })
  })

  return codes
}

const formatOptionCarriers = (option) => {
  const carrierDisplay = firstValue([
    option?.carrierName,
    option?.airlineName,
    option?.carrierDisplayName,
    option?.airlineDisplayName,
  ])
  if (carrierDisplay) return formatCarriers(carrierDisplay)

  const carrierCode = firstValue([
    option?.carriers,
    option?.carrier,
    option?.carrierCode,
    option?.airline,
    option?.airlineCode,
  ])
  if (carrierCode) return formatCarriers(carrierCode)

  const nestedCarrierCodes = collectNestedCarrierCodes(option)
  if (nestedCarrierCodes.length) return formatCarriers(nestedCarrierCodes)

  return formatCarriers(firstValue([
    option?.supplierName,
    option?.bookName,
    option?.supplierDisplayName,
    option?.bookDisplayName,
    option?.sourceName,
    option?.source,
  ]))
}

const buildDateItems = (dates) => {
  const sorted = [...new Set(dates.filter(Boolean))].sort()
  if (!sorted.length) return []

  const items = []
  let rangeStart = sorted[0]
  let prevDate = sorted[0]

  const addDays = (dateStr, days) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const utc = new Date(Date.UTC(year, month - 1, day))
    utc.setUTCDate(utc.getUTCDate() + days)
    return utc.toISOString().slice(0, 10)
  }

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]
    const expectedNext = addDays(prevDate, 1)
    if (current !== expectedNext) {
      items.push(formatDateRangeItem(rangeStart, prevDate))
      rangeStart = current
    }
    prevDate = current
  }

  items.push(formatDateRangeItem(rangeStart, prevDate))
  return items
}

export function SnapshotsList({
  snapshots,
  onDeleteWatchItem,
  onDeleteRoute,
}) {
  const [openRouteKey, setOpenRouteKey] = useState(null)
  const [deletingRouteKey, setDeletingRouteKey] = useState(null)
  const [deletingWatchItems, setDeletingWatchItems] = useState({})

  const groupedSnapshots = Object.values(snapshots || {}).reduce((acc, snapshot) => {
    const routeKey = `${snapshot.route?.origin}-${snapshot.route?.dest}`
    if (!acc[routeKey]) acc[routeKey] = []
    acc[routeKey].push(snapshot)
    return acc
  }, {})

  if (!snapshots || !Object.keys(snapshots).length) {
    return (
      <section className="panel snapshots-empty">
        <span className="panel-kicker">Results</span>
        <h3>No results yet</h3>
        <p>Run a search to create route snapshots and compare prices by travel date.</p>
      </section>
    )
  }

  return (
    <section className="snapshots-board">
      <div className="snapshots-boardHeader">
        <div>
          <span className="panel-kicker">Results</span>
          <h2>Tracked routes</h2>
        </div>
        <span>{Object.keys(groupedSnapshots).length} route{Object.keys(groupedSnapshots).length === 1 ? '' : 's'}</span>
      </div>

      {Object.entries(groupedSnapshots).map(([routeKey, routeSnapshots]) => {
        const dates = routeSnapshots.map((s) => s.date)
        const dateItems = buildDateItems(dates)
        const visibleItems = dateItems.slice(0, 3)
        const hasMoreItems = dateItems.length > 3
        const isOpen = openRouteKey === routeKey
        const routeWatchItemIds = routeSnapshots.map((s) => s.watchItemId).filter(Boolean)
        const isDeletingRoute = deletingRouteKey === routeKey
        const routeMinPrice = routeSnapshots.reduce((min, snapshot) => {
          if (snapshot.minPrice == null) return min
          return min == null || snapshot.minPrice < min ? snapshot.minPrice : min
        }, null)

        return (
          <section className="panel route-panel" key={routeKey}>
            <div
              className="snapshots-routeHeader"
              role="button"
              tabIndex={0}
              onClick={() => setOpenRouteKey(isOpen ? null : routeKey)}
              onKeyDown={(ev) => {
                if (ev.key !== 'Enter' && ev.key !== ' ') return
                ev.preventDefault()
                setOpenRouteKey(isOpen ? null : routeKey)
              }}
            >
              <div className="snapshots-routeInfo">
                <span className="route-chip">{isOpen ? 'Expanded route' : 'Route'}</span>
                <h3>
                  {formatAirportLabel(routeSnapshots[0]?.route?.origin)} →{' '}
                  {formatAirportLabel(routeSnapshots[0]?.route?.dest)}
                </h3>
                {!isOpen && (
                  <div className="snapshots-routeDates">
                    {dateItems.length ? (
                      <>
                        {visibleItems.map((item, index) => (
                          <p className="snapshots-dateLine" key={`${routeKey}-date-${item}`}>
                            <span className={`snapshots-dateLabel${index === 0 ? '' : ' is-empty'}`}>
                              Dates:
                            </span>
                            <span className="snapshots-dateValue">{item}</span>
                          </p>
                        ))}
                        {hasMoreItems && (
                          <p className="snapshots-dateLine" key={`${routeKey}-more`}>
                            <span className="snapshots-dateLabel is-empty">Dates:</span>
                            <span className="snapshots-dateValue">more</span>
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="snapshots-dateLine">Dates: N/A</p>
                    )}
                  </div>
                )}
              </div>
              <div className="route-actions">
                <div className="route-metrics">
                  <span>{routeMinPrice != null ? routeMinPrice : 'N/A'}</span>
                  <small>Best price</small>
                </div>
                <span className="route-toggle">{isOpen ? 'Hide' : 'View'}</span>
                <button
                  type="button"
                  className="ghost-danger"
                  disabled={isDeletingRoute || !routeWatchItemIds.length}
                  onClick={async (ev) => {
                    ev.stopPropagation()
                    if (isDeletingRoute) return
                    setDeletingRouteKey(routeKey)
                    try {
                      await onDeleteRoute(routeWatchItemIds)
                    } finally {
                      setDeletingRouteKey(null)
                    }
                  }}
                >
                  {isDeletingRoute ? 'Deleting…' : 'Delete route'}
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="snapshots-dates">
                {routeSnapshots.map((snapshot) => {
                  const options = Array.isArray(snapshot.options) ? snapshot.options : []
                  const cheapestOption =
                    options.length
                      ? options.reduce(
                        (min, opt) => (opt.price < min.price ? opt : min),
                        options[0]
                      )
                      : null

                  return (
                    <div className="snapshot-card" key={snapshot.watchItemId}>
                      <div className="snapshot-cardHeader">
                        <div>
                          <span className="panel-kicker">Travel date</span>
                          <h4 className="snapshot-date">{snapshot.date}</h4>
                        </div>
                        <div className="snapshot-meta">
                          <span className="snapshot-minPrice">
                            <small>Min price</small>
                            {snapshot.minPrice != null
                              ? `${snapshot.minPrice} ${cheapestOption?.currency ?? ''}`.trim()
                              : 'N/A'}
                          </span>

                          <button
                            className="snapshot-deleteBtn"
                            type="button"
                            disabled={
                              !snapshot.watchItemId ||
                              deletingWatchItems[snapshot.watchItemId]
                            }
                            onClick={async (ev) => {
                              ev.stopPropagation()
                              if (
                                !snapshot.watchItemId ||
                                deletingWatchItems[snapshot.watchItemId]
                              )
                                return

                              setDeletingWatchItems((prev) => ({
                                ...prev,
                                [snapshot.watchItemId]: true,
                              }))

                              try {
                                await onDeleteWatchItem(snapshot.watchItemId)
                              } finally {
                                setDeletingWatchItems((prev) => {
                                  const next = { ...prev }
                                  delete next[snapshot.watchItemId]
                                  return next
                                })
                              }
                            }}
                          >
                            {deletingWatchItems[snapshot.watchItemId]
                              ? 'Deleting…'
                              : 'Delete'}
                          </button>
                        </div>
                      </div>

                      {options.length ? (
                        <ul className="snapshot-options">
                          {options.map((option) => {
                            const googleFlightsUrl = buildGoogleFlightsLink(option)

                            return (
                              <li className="snapshot-option" key={option.key}>
                                <span className="opt-price">
                                  {option.price} {option.currency}
                                </span>
                                <span className="opt-stops">
                                  <small>Stops</small>
                                  {option.stops}
                                </span>
                                <span className="opt-carriers">
                                  <small>Carriers</small>
                                  {formatOptionCarriers(option)}
                                </span>
                                <span className="opt-times">
                                  <small>Times</small>
                                  {option.dep} → {option.arr}
                                </span>
                                {googleFlightsUrl && (
                                  <a
                                    href={googleFlightsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Open flights
                                  </a>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <p>No options</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </section>
  )
}
