import { useMemo } from 'react'

export function MatchesSection({
  snapshots,
  maxNonstop,
  maxOnestop,
  maxHours,
}) {
  const hasMatchConstraints = useMemo(
    () =>
      Number.isFinite(maxNonstop) ||
      Number.isFinite(maxOnestop) ||
      Number.isFinite(maxHours),
    [maxNonstop, maxOnestop, maxHours]
  )

  const matchedOptions = useMemo(() => {
    if (!hasMatchConstraints) return []

    return Object.values(snapshots || {}).flatMap((snapshot) => {
      const options = Array.isArray(snapshot?.options) ? snapshot.options : []

      return options
        .filter((option) => {
          const stops = Number(option?.stops)
          if (!Number.isFinite(stops) || stops >= 2) return false
          if (stops !== 0 && stops !== 1) return false

          const price = Number(option?.price)
          if (stops === 0 && Number.isFinite(maxNonstop)) {
            if (!Number.isFinite(price) || price > maxNonstop) return false
          }
          if (stops === 1 && Number.isFinite(maxOnestop)) {
            if (!Number.isFinite(price) || price > maxOnestop) return false
          }

          if (Number.isFinite(maxHours)) {
            const durationMins = Number(option?.durationMins)
            if (!Number.isFinite(durationMins)) return false
            if (durationMins > maxHours * 60) return false
          }

          return true
        })
        .map((option) => ({
          snapshotId: snapshot.watchItemId,
          date: snapshot.date,
          route: snapshot.route,
          option,
        }))
    })
  }, [hasMatchConstraints, snapshots, maxNonstop, maxOnestop, maxHours])

  if (!hasMatchConstraints) return null

  return (
    <section className="panel">
      <h3>Matches</h3>
      {matchedOptions.length ? (
        <ul className="snapshot-options">
          {matchedOptions.map(({ snapshotId, date, route, option }, index) => (
            <li className="snapshot-option" key={`match-${snapshotId || 'snapshot'}-${option.key || index}`}>
              <span className="opt-times">
                {(route?.origin || 'N/A')} → {(route?.dest || 'N/A')} | {date || 'N/A'}
              </span>
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
        <p>No matches</p>
      )}
    </section>
  )
}
