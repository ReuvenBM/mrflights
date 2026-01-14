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
        const dates = routeSnapshots.map((s) => s.date).sort()
        const minDate = dates[0]
        const maxDate = dates[dates.length - 1]
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
              <h3>
                {formatAirportLabel(routeSnapshots[0]?.route?.origin)} →{' '}
                {formatAirportLabel(routeSnapshots[0]?.route?.dest)}
              </h3>
              <p>
                {minDate} - {maxDate}
              </p>
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