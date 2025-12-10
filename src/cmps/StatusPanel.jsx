import { formatVal } from '../services/deals.utils'

export function StatusPanel({ status, loading, onRefresh }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Status</h2>
        <div className="actions">
          <button onClick={onRefresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
        </div>
      </header>
      <div className="status-grid">
        <div><strong>Running:</strong> {status?.running ? 'Yes' : 'No'}</div>
        <div><strong>Last start:</strong> {formatVal(status?.lastRunStarted || status?.lastRun)}</div>
        <div><strong>Last finish:</strong> {formatVal(status?.lastRunFinished)}</div>
        <div><strong>Hits count:</strong> {status?.hitsCount ?? (Array.isArray(status?.hits) ? status.hits.length : '-')}</div>
        <div><strong>Error:</strong> {formatVal(status?.error || status?.lastError)}</div>
      </div>
    </section>
  )
}
