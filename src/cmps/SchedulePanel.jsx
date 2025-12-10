import { formatVal } from '../services/deals.utils'

export function SchedulePanel({ schedule, supported, loading, onRefresh }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Schedule</h2>
        {supported && <button onClick={onRefresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>}
      </header>
      {supported ? (
        <div className="status-grid">
          <div><strong>Active:</strong> {schedule?.active ? 'Yes' : 'No'}</div>
          <div><strong>Interval (min):</strong> {schedule?.intervalMinutes ?? '-'}</div>
          <div><strong>Last start:</strong> {formatVal(schedule?.lastRunStarted || schedule?.lastRun)}</div>
          <div><strong>Last finish:</strong> {formatVal(schedule?.lastRunFinished)}</div>
          <div><strong>Error:</strong> {formatVal(schedule?.error)}</div>
        </div>
      ) : (
        <p>Schedule API not available (404).</p>
      )}
    </section>
  )
}
