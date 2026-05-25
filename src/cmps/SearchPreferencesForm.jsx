import { useEffect, useMemo, useRef, useState } from 'react'
import { parseList } from '../services/deals.utils'
import { getAirportOptions } from '../services/airport.service'

function SearchableAirportSelect({ name, value, onChange, options, placeholder }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => options.find((o) => String(o.code) === String(value)),
    [options, value]
  )
  const displayValue = selected ? `${selected.label} (${selected.code})` : ''

  useEffect(() => {
    if (!open) setQuery(displayValue)
  }, [displayValue, open])

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    if (!q) return options

    return options.filter((o) => {
      const code = String(o.code || '').toLowerCase()
      const label = String(o.label || '').toLowerCase()
      return code.includes(q) || label.includes(q)
    })
  }, [options, query])
  const hasExactSelection = selected && query.trim() === displayValue
  const showClear = hasExactSelection && !open

  function selectOption(option) {
    onChange({ target: { name, value: option ? option.code : '' } })
    setOpen(false)
  }

  function onKeyDown(ev) {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      if (filtered[0]) selectOption(filtered[0])
    }
    if (ev.key === 'Escape') {
      setOpen(false)
      setQuery(displayValue)
    }
  }

  return (
    <div className="airport-select">
      <input
        className="airport-select-input"
        value={query}
        placeholder={placeholder}
        onFocus={() => {
          if (!hasExactSelection) setOpen(true)
        }}
        onChange={(ev) => {
          setQuery(ev.target.value)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false)
            setQuery(displayValue)
          }, 120)
        }}
      />
      {showClear && (
        <button
          type="button"
          className="airport-select-clear"
          onMouseDown={(ev) => {
            ev.preventDefault()
            ev.stopPropagation()
          }}
          onClick={() => {
            onChange({ target: { name, value: '' } })
            setQuery('')
            setOpen(false)
          }}
          aria-label="Clear selection"
          title="Clear"
        >
          ×
        </button>
      )}

      {open && (
        <div className="airport-select-list">
          {filtered.map((o) => (
            <button
              key={o.code}
              type="button"
              className="airport-select-option"
              onMouseDown={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
              }}
              onClick={() => selectOption(o)}
              disabled={String(o.code) === String(value)}
              title={o.code}
            >
              {o.label} ({o.code})
            </button>
          ))}

          {!filtered.length && !hasExactSelection && <div className="hint">No matches</div>}
        </div>
      )}
    </div>
  )
}

export function SearchPreferencesForm({
  configForm,
  datesList,
  dateRange,
  onDateRangeChange,
  onAddRange,
  onRemoveDate,
  onChange,
  onRun,
  running,
  isOpen,
  onToggle,
  onCollapse,
}) {
  const panelRef = useRef(null)
  const airportOptions = useMemo(() => {
    const list = getAirportOptions().slice()
    return list.sort((a, b) => {
      const countryA = String(a.label || '').split(',').pop()?.trim().toLowerCase() || ''
      const countryB = String(b.label || '').split(',').pop()?.trim().toLowerCase() || ''
      if (countryA !== countryB) return countryA.localeCompare(countryB)

      const labelA = String(a.label || '').toLowerCase()
      const labelB = String(b.label || '').toLowerCase()
      if (labelA !== labelB) return labelA.localeCompare(labelB)

      return String(a.code || '').toLowerCase().localeCompare(String(b.code || '').toLowerCase())
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return
    function handleOutsideClick(ev) {
      if (!panelRef.current) return
      if (panelRef.current.contains(ev.target)) return
      onCollapse?.()
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen, onCollapse])

  return (
    <section
      ref={panelRef}
      className={`panel search-preferences ${isOpen ? 'open' : 'closed'}`}
      onClick={() => {
        if (!isOpen) onToggle?.()
      }}
    >
      <header
        className="panel-header"
        role="button"
        tabIndex={0}
        onClick={(ev) => {
          onToggle?.()
          ev.stopPropagation()
        }}
        onKeyDown={(ev) => {
          if (ev.key !== 'Enter' && ev.key !== ' ') return
          ev.preventDefault()
          ev.stopPropagation()
          onToggle?.()
        }}
      >
        <div>
          <span className="panel-kicker">Route setup</span>
          <h2>Search Preferences</h2>
        </div>
        <span className="panel-toggle">{isOpen ? 'Collapse' : 'Edit search'}</span>
      </header>

      {isOpen && (
        <form className="form">
          <div className="search-grid">
            <label className="field-card">
              <span>Origin</span>
              <SearchableAirportSelect
                name="origins"
                value={configForm.origins || ''}
                onChange={onChange}
                options={airportOptions}
                placeholder="Type a city or code (e.g. Tel Aviv / TLV)"
              />
            </label>

            <label className="field-card">
              <span>Destination</span>
              <SearchableAirportSelect
                name="dests"
                value={configForm.dests || ''}
                onChange={onChange}
                options={airportOptions}
                placeholder="Type a city or code (e.g. Bangkok / BKK)"
              />
            </label>
          </div>

          <div className="date-panel">
            <div className="date-picker-row">
              <label>
                Date range (start)
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(ev) => onDateRangeChange('start', ev.target.value)}
                />
              </label>

              <label>
                Date range (end)
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(ev) => onDateRangeChange('end', ev.target.value)}
                />
              </label>

              <button type="button" onClick={onAddRange} disabled={!dateRange.start || !dateRange.end}>
                Add range
              </button>
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
          </div>

          {/* <div className="triple">
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
          </div> */}

          <div className="actions search-actions">
            <button
              type="button"
              className="primary-action"
              onClick={() => {
                onRun?.()
                onCollapse?.()
              }}
              disabled={running}
            >
              {running ? 'Running…' : 'Run now'}
            </button>

            {/* {scheduleSupported && (
            <>
              <button type="button" onClick={onStartSchedule} disabled={updatingSchedule || !canStartSchedule}>
                {updatingSchedule ? 'Working…' : 'Start schedule'}
              </button>

              <button type="button" onClick={onStopSchedule} disabled={updatingSchedule}>
                {updatingSchedule ? 'Working…' : 'Stop schedule'}
              </button>
            </>
          )} */}
          </div>
        </form>
      )}
    </section>
  )
}
