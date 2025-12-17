import { dealDate, safeText, buildFlightLink } from '../services/deals.utils'

export function DealsList({ title, deals, onReload }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{title}</h2>
        {/* <button onClick={onReload}>Reload</button> */}
      </header>
      {(!deals || deals.length === 0) && <p>No deals yet</p>}
      {deals?.map((d) => (
        <article key={`${title}-${d.key || `${dealDate(d)}-${d.dep || d.date || ''}`}`} className="deal-card">
          <header>
            <div>{dealDate(d)}</div>
            <div>{safeText(d.origin)} → {safeText(d.dest)}</div>
          </header>
          <div className="price">
            ${safeText(d.price)} {safeText(d.currency)}
          </div>
          <div className="meta">
            <div>{d.nonStop ? 'Nonstop' : `Stops: ${safeText(d.stops)}`}</div>
            <div>{safeText(d.carriers)}</div>
            <div>≈ {Math.round((d.durationMins || 0) / 60)}h</div>
          </div>
          <div className="times">
            <div>Dep: {safeText(d.dep)}</div>
            <div>Arr: {safeText(d.arr)}</div>
          </div>
          <div className="legs">{safeText(d.legs)}</div>
          {(() => {
            const link = buildFlightLink(d)
            if (!link) return null

            return (
              <div className="cta">
                <a href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </div>
            )
          })()}
        </article>
      ))}
    </section>
  )
}

