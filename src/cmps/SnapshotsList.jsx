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

  return (
    <>
      {!snapshots || !Object.keys(snapshots || {}).length ? (
        <section className="panel">
          <h3>No results yet</h3>
        </section>
      ) : (
        Object.entries(groupedSnapshots).map(([routeKey, routeSnapshots]) => {
          const dates = routeSnapshots.map((snapshot) => snapshot.date).sort()
          const minDate = dates[0]
          const maxDate = dates[dates.length - 1]
          const isOpen = openRouteKey === routeKey
          const routeWatchItemIds = routeSnapshots.map((snapshot) => snapshot.watchItemId).filter(Boolean)
          const isDeletingRoute = deletingRouteKey === routeKey

          return (
            <section className="panel" key={routeKey}>
              <div
                onClick={() => setOpenRouteKey(isOpen ? null : routeKey)}
                role="button"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key !== 'Enter' && ev.key !== ' ') return
                  ev.preventDefault()
                  setOpenRouteKey(isOpen ? null : routeKey)
                }}
              >
                <h3>
                  {formatAirportLabel(routeSnapshots[0]?.route?.origin)} → {formatAirportLabel(routeSnapshots[0]?.route?.dest)}
                </h3>
                <p>{minDate} - {maxDate}</p>
                <button
                  type="button"
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
                  disabled={isDeletingRoute || !routeWatchItemIds.length}
                >
                  {isDeletingRoute ? 'Deleting…' : 'Delete route'}
                </button>
              </div>
              {isOpen && (
                <div>
                  {routeSnapshots.map((snapshot) => (
                    <div key={snapshot.watchItemId}>
                      <h4>{snapshot.date}</h4>
                      <p>Min price: {snapshot.minPrice ?? 'N/A'} </p>
                      <button
                        type="button"
                        onClick={async (ev) => {
                          ev.stopPropagation()
                          if (!snapshot.watchItemId || deletingWatchItems[snapshot.watchItemId]) return
                          setDeletingWatchItems((prev) => ({ ...prev, [snapshot.watchItemId]: true }))
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
                        disabled={!snapshot.watchItemId || deletingWatchItems[snapshot.watchItemId]}
                      >
                        {deletingWatchItems[snapshot.watchItemId] ? 'Deleting…' : 'Delete'}
                      </button>
                      {Array.isArray(snapshot.options) && snapshot.options.length ? (
                        <ul>
                          {snapshot.options.map((option) => (
                            <li key={option.key}>
                              {option.price} {option.currency} | stops: {option.stops} | carriers: {option.carriers} | {option.dep} → {option.arr}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No options</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })
      )}
    </>
  )
}
