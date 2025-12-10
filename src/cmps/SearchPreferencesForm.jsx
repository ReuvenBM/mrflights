import { parseList } from '../services/deals.utils'

export function SearchPreferencesForm({
  configForm,
  datesList,
  dateRange,
  onDateRangeChange,
  onAddRange,
  onRemoveDate,
  onChange,
  onRun,
  onStartSchedule,
  onStopSchedule,
  running,
  updatingSchedule,
  scheduleSupported,
  canStartSchedule
}) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Search Preferences</h2>
      </header>
      <form className="form">
        <label>
          Origins (comma separated)
          <input name="origins" value={configForm.origins} onChange={onChange} />
        </label>
        <label>
          Destinations (comma separated)
          <input name="dests" value={configForm.dests} onChange={onChange} />
        </label>
        <div className="date-picker-row">
          <label>
            Date range (start)
            <input type="date" value={dateRange.start} onChange={(ev) => onDateRangeChange('start', ev.target.value)} />
          </label>
          <label>
            Date range (end)
            <input type="date" value={dateRange.end} onChange={(ev) => onDateRangeChange('end', ev.target.value)} />
          </label>
          <button type="button" onClick={onAddRange} disabled={!dateRange.start || !dateRange.end}>Add range</button>
        </div>
        <div className="chips">
          {(Array.isArray(datesList) ? datesList : parseList(datesList)).map((d) => (
            <span className="chip" key={d}>
              {d}
              <button type="button" onClick={() => onRemoveDate(d)}>×</button>
            </span>
          ))}
          {(!datesList || (Array.isArray(datesList) && datesList.length === 0)) && (
            <span className="hint">Add at least one date</span>
          )}
        </div>
        <label>
          Currency
          <input name="currency" value={configForm.currency} onChange={onChange} />
        </label>
        <div className="triple">
          <label>
            Max nonstop $
            <input name="maxNonstop" type="number" min="0" value={configForm.maxNonstop} onChange={onChange} />
          </label>
          <label>
            Max one-stop $
            <input name="maxOnestop" type="number" min="0" value={configForm.maxOnestop} onChange={onChange} />
          </label>
          <label>
            Max hours
            <input name="maxHours" type="number" min="1" value={configForm.maxHours} onChange={onChange} />
          </label>
          <label>
            Interval (minutes)
            <input name="intervalMinutes" type="number" min="1" value={configForm.intervalMinutes} onChange={onChange} />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={onRun} disabled={running}>{running ? 'Running…' : 'Run now'}</button>
          {scheduleSupported && (
            <>
              <button type="button" onClick={onStartSchedule} disabled={updatingSchedule || !canStartSchedule}>
                {updatingSchedule ? 'Working…' : 'Start schedule'}
              </button>
              <button type="button" onClick={onStopSchedule} disabled={updatingSchedule}>
                {updatingSchedule ? 'Working…' : 'Stop schedule'}
              </button>
            </>
          )}
        </div>
      </form>
    </section>
  )
}
