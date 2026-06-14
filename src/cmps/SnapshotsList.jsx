import { useRef, useState } from 'react'
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

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatRouteDateChip = (dateStr) => {
  const [year, month, day] = String(dateStr || '').split('-').map(Number)
  if (!year || !month || !day) return String(dateStr || '')
  return `${MONTH_LABELS[month - 1]} ${day}`
}

const formatSnapshotDate = (dateStr) => {
  const [year, month, day] = String(dateStr || '').split('-').map(Number)
  if (!year || !month || !day) return String(dateStr || '')
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const formatLastChecked = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = Date.now()
  const diffMinutes = Math.floor((now - date.getTime()) / 60000)
  if (diffMinutes >= 0 && diffMinutes < 60) {
    if (diffMinutes < 1) return 'Last checked: now'
    return `Last checked: ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const isToday = date.toDateString() === new Date(now).toDateString()
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isToday) return `Last checked: today ${time}`

  const day = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return `Last checked: ${day} ${time}`
}

const RECOMMENDATION_LABELS = {
  BUY: 'Buy now',
  GOOD_DEAL: 'Good deal',
  WAIT: 'Wait',
  WATCH: 'Watch',
}

const RECOMMENDATION_ORDER = ['BUY', 'GOOD_DEAL', 'WATCH', 'WAIT']

const ROUTE_RECOMMENDATION_TEXT = {
  BUY: 'Buy now',
  GOOD_DEAL: 'Good deal',
  WATCH: 'Worth watching',
  WAIT: 'Wait',
}

const formatRecommendationAction = (action) => {
  const key = String(action || '').trim().toUpperCase()
  if (!key) return ''
  if (RECOMMENDATION_LABELS[key]) return RECOMMENDATION_LABELS[key]
  return key
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const getRecommendationClass = (action) => {
  const key = String(action || '').trim().toLowerCase().replaceAll('_', '-')
  return key ? ` recommendation-${key}` : ''
}

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

const buildRouteDateItems = (dates) => [...new Set(dates.filter(Boolean))].sort()

export function SnapshotsList({
  snapshots,
  watchItems,
  onDeleteWatchItem,
  onUpdateTargetPrice,
  onDeleteRoute,
}) {
  const [openRouteKey, setOpenRouteKey] = useState(null)
  const [deletingRouteKey, setDeletingRouteKey] = useState(null)
  const [deletingWatchItems, setDeletingWatchItems] = useState({})
  const [editingTargetPrice, setEditingTargetPrice] = useState(null)
  const [savingTargetPrices, setSavingTargetPrices] = useState({})
  const routeRefs = useRef({})

  const groupedSnapshots = Object.values(snapshots || {}).reduce((acc, snapshot) => {
    const routeKey = `${snapshot.route?.origin}-${snapshot.route?.dest}`
    if (!acc[routeKey]) acc[routeKey] = []
    acc[routeKey].push(snapshot)
    return acc
  }, {})

  const watchItemsById = (Array.isArray(watchItems) ? watchItems : []).reduce((acc, item) => {
    if (item?._id) acc[String(item._id)] = item
    return acc
  }, {})

  const getSnapshotRecommendation = (snapshot) => (
    snapshot?.watchItemId
      ? watchItemsById[String(snapshot.watchItemId)]?.recommendation
      : null
  )

  const getLastChecked = (snapshot) => {
    const watchItem = snapshot?.watchItemId
      ? watchItemsById[String(snapshot.watchItemId)]
      : null

    return formatLastChecked(
      watchItem?.recommendation?.computedAt ||
      watchItem?.lastRunAt ||
      watchItem?.updatedAt ||
      snapshot?.updatedAt ||
      snapshot?.snapshotUpdatedAt
    )
  }

  const getRouteRecommendation = (routeSnapshots) => {
    const actions = routeSnapshots
      .map((snapshot) => String(getSnapshotRecommendation(snapshot)?.action || '').trim().toUpperCase())
      .filter(Boolean)

    const action = RECOMMENDATION_ORDER.find((item) => actions.includes(item)) || actions.sort()[0]
    if (!action) return null

    return {
      action,
      text: ROUTE_RECOMMENDATION_TEXT[action] || `Recommendation: ${formatRecommendationAction(action)}`,
    }
  }

  const toggleRoute = (routeKey, isOpen) => {
    setOpenRouteKey(isOpen ? null : routeKey)

    if (!isOpen) {
      requestAnimationFrame(() => {
        routeRefs.current[routeKey]?.scrollIntoView({ block: 'start' })
      })
    }
  }

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
        const orderedRouteSnapshots = [...routeSnapshots].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
        const dates = routeSnapshots.map((s) => s.date)
        const dateItems = buildRouteDateItems(dates)
        const visibleItems = dateItems.slice(0, 2)
        const hiddenItemsCount = Math.max(dateItems.length - visibleItems.length, 0)
        const isOpen = openRouteKey === routeKey
        const routeWatchItemIds = routeSnapshots.map((s) => s.watchItemId).filter(Boolean)
        const isDeletingRoute = deletingRouteKey === routeKey
        const routeRecommendation = getRouteRecommendation(routeSnapshots)
        const routeMinPrice = routeSnapshots.reduce((min, snapshot) => {
          if (snapshot.minPrice == null) return min
          return min == null || snapshot.minPrice < min ? snapshot.minPrice : min
        }, null)

        return (
          <section
            className="panel route-panel"
            key={routeKey}
            ref={(el) => {
              if (el) routeRefs.current[routeKey] = el
              else delete routeRefs.current[routeKey]
            }}
          >
            <div
              className="snapshots-routeHeader"
              role="button"
              tabIndex={0}
              onClick={() => toggleRoute(routeKey, isOpen)}
              onKeyDown={(ev) => {
                if (ev.key !== 'Enter' && ev.key !== ' ') return
                ev.preventDefault()
                toggleRoute(routeKey, isOpen)
              }}
            >
              <div className="snapshots-routeInfo">
                <span className="route-chip">{isOpen ? 'Expanded route' : 'Route'}</span>
                <h3>
                  {formatAirportLabel(routeSnapshots[0]?.route?.origin)} →{' '}
                  {formatAirportLabel(routeSnapshots[0]?.route?.dest)}
                </h3>
                {routeRecommendation && (
                  <p className={`route-recommendation${getRecommendationClass(routeRecommendation.action)}`}>
                    {routeRecommendation.text}
                  </p>
                )}
                {!isOpen && (
                  <div className="snapshots-routeDates" aria-label="Travel dates">
                    {visibleItems.length ? (
                      <>
                        {visibleItems.map((item) => (
                          <span className="route-dateChip" key={`${routeKey}-date-${item}`}>
                            {formatRouteDateChip(item)}
                          </span>
                        ))}
                        {hiddenItemsCount > 0 && (
                          <span className="route-dateChip is-more">
                            +{hiddenItemsCount} date{hiddenItemsCount === 1 ? '' : 's'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="route-dateChip is-empty">No dates</span>
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
                {orderedRouteSnapshots.map((snapshot) => {
                  const options = Array.isArray(snapshot.options) ? snapshot.options : []
                  const watchItem = snapshot?.watchItemId
                    ? watchItemsById[String(snapshot.watchItemId)]
                    : null
                  const recommendation = getSnapshotRecommendation(snapshot)
                  const recommendationAction = recommendation?.action
                  const recommendationLabel = formatRecommendationAction(recommendationAction)
                  const lastChecked = getLastChecked(snapshot)
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
                          <h4 className="snapshot-date">{formatSnapshotDate(snapshot.date)}</h4>
                          {lastChecked && <small className="snapshot-lastChecked">{lastChecked}</small>}
                        </div>
                        <div className="snapshot-meta">
                          {recommendationLabel && (
                            <span className={`snapshot-recommendation${getRecommendationClass(recommendationAction)}`}>
                              <small>Decision</small>
                              {recommendationLabel}
                            </span>
                          )}
                          <span className="snapshot-minPrice">
                            <small>Min price</small>
                            {snapshot.minPrice != null
                              ? `${snapshot.minPrice} ${cheapestOption?.currency ?? ''}`.trim()
                              : 'N/A'}
                          </span>

                          <button
                            className="snapshot-alertPrice"
                            type="button"
                            disabled={!snapshot.watchItemId}
                            onClick={() => {
                              setEditingTargetPrice({
                                watchItemId: snapshot.watchItemId,
                                value: watchItem?.targetPrice ?? '',
                              })
                            }}
                          >
                            {watchItem?.targetPrice ? 'Edit alert' : 'Set alert'}
                          </button>

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
      {editingTargetPrice && (
        <div className="modal-backdrop" role="presentation">
          <form
            className="target-price-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Edit target price alert"
            onSubmit={async (ev) => {
              ev.preventDefault()
              const { watchItemId, value } = editingTargetPrice
              if (!watchItemId || savingTargetPrices[watchItemId]) return

              setSavingTargetPrices((prev) => ({
                ...prev,
                [watchItemId]: true,
              }))

              try {
                await onUpdateTargetPrice(watchItemId, value)
                setEditingTargetPrice(null)
              } finally {
                setSavingTargetPrices((prev) => {
                  const next = { ...prev }
                  delete next[watchItemId]
                  return next
                })
              }
            }}
          >
            <div>
              <span className="panel-kicker">Price alert</span>
              <h3>Target price</h3>
            </div>
            <label>
              <span>Notify me when price drops below</span>
              <input
                type="number"
                min="0"
                value={editingTargetPrice.value}
                onChange={(ev) => {
                  const { value } = ev.target
                  setEditingTargetPrice((prev) => ({ ...prev, value }))
                }}
                autoFocus
              />
            </label>
            <div className="target-price-dialogActions">
              <button
                type="button"
                onClick={() => setEditingTargetPrice(null)}
                disabled={savingTargetPrices[editingTargetPrice.watchItemId]}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-action"
                disabled={savingTargetPrices[editingTargetPrice.watchItemId]}
              >
                {savingTargetPrices[editingTargetPrice.watchItemId] ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
