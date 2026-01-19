import { useState } from 'react'
import { AIRPORT_OPTIONS, buildAirportMap } from '../services/airport.service'

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

export function SnapshotsList({ snapshots, onDeleteWatchItem, onDeleteRoute }) {
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
      <section className="panel">
        <h3>No results yet</h3>
      </section>
    )
  }

  return (
    <>
      {Object.entries(groupedSnapshots).map(([routeKey, routeSnapshots]) => {
        const dates = routeSnapshots.map((s) => s.date)
        const dateItems = buildDateItems(dates)
        const visibleItems = dateItems.slice(0, 3)
        const hasMoreItems = dateItems.length > 3
        const isOpen = openRouteKey === routeKey
        const routeWatchItemIds = routeSnapshots.map((s) => s.watchItemId).filter(Boolean)
        const isDeletingRoute = deletingRouteKey === routeKey

        return (
          <section className="panel" key={routeKey}>
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
                <h3>
                  {formatAirportLabel(routeSnapshots[0]?.route?.origin)} →{' '}
                  {formatAirportLabel(routeSnapshots[0]?.route?.dest)}
                </h3>
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
              </div>
              <button
                type="button"
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

            {isOpen && (
              <div className="snapshots-dates">
                {routeSnapshots.map((snapshot) => {
                  const cheapestOption =
                    Array.isArray(snapshot.options) && snapshot.options.length
                      ? snapshot.options.reduce(
                        (min, opt) => (opt.price < min.price ? opt : min),
                        snapshot.options[0]
                      )
                      : null

                  return (
                    <div className="snapshot-card" key={snapshot.watchItemId}>
                      <div className="snapshot-cardHeader">
                        <h4 className="snapshot-date">{snapshot.date}</h4>
                        <div className="snapshot-meta">
                          <span className="snapshot-minPrice">
                            Min price:{' '}
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

                      {Array.isArray(snapshot.options) && snapshot.options.length ? (
                        <ul className="snapshot-options">
                          {snapshot.options.map((option) => (
                            <li className="snapshot-option" key={option.key}>
                              <span className="opt-price">
                                {option.price} {option.currency}
                              </span>
                              <span className="opt-stops">
                                stops: {option.stops}
                              </span>
                              <span className="opt-carriers">
                                carriers: {option.carriers}
                              </span>
                              <span className="opt-times">
                                {option.dep} → {option.arr}
                              </span>
                            </li>
                          ))}
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
    </>
  )
}
