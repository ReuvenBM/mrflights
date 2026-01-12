export function SnapshotsList({ snapshots }) {
  return (
    <>
      {!snapshots || !Object.keys(snapshots || {}).length ? (
        <section className="panel">
          <h3>No results yet</h3>
        </section>
      ) : (
        Object.values(snapshots).map((snapshot) => (
          <section className="panel" key={snapshot.watchItemId}>
            <h3>{snapshot.route?.origin} → {snapshot.route?.dest}</h3>
            <div>
              <h4>{snapshot.date}</h4>
              <p>Min price: {snapshot.minPrice ?? 'N/A'} | Count: {snapshot.count ?? 0}</p>
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
          </section>
        ))
      )}
    </>
  )
}
