import { useState } from 'react'

export function SnapshotsList({ snapshots }) {
  const [openRouteKey, setOpenRouteKey] = useState(null)

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
                  {routeSnapshots[0]?.route?.origin} → {routeSnapshots[0]?.route?.dest}
                </h3>
                <p>{minDate} - {maxDate}</p>
              </div>
              {isOpen && (
                <div>
                  {routeSnapshots.map((snapshot) => (
                    <div key={snapshot.watchItemId}>
                      <h4>{snapshot.date}</h4>
                      <p>Min price: {snapshot.minPrice ?? 'N/A'} </p>
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
