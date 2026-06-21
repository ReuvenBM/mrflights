import { useEffect, useMemo, useRef, useState } from 'react'
import { parseList } from '../services/deals.utils'
import { getAirportOptions } from '../services/airport.service'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function getTodayDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey || '').split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDateLabel(dateKey) {
  const date = parseDateKey(dateKey)
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getUTCFullYear()
  const month = monthDate.getUTCMonth()
  const first = new Date(Date.UTC(year, month, 1))
  const start = new Date(first)
  start.setUTCDate(first.getUTCDate() - first.getUTCDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    return date
  })
}

function DateRangePicker({ dateRange, onDateRangeChange, onAddRange }) {
  const initialMonth = parseDateKey(dateRange.start) || parseDateKey(dateRange.end) || new Date()
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(Date.UTC(initialMonth.getUTCFullYear(), initialMonth.getUTCMonth(), 1))
  )

  const startDate = parseDateKey(dateRange.start)
  const endDate = parseDateKey(dateRange.end)
  const startTime = startDate?.getTime()
  const endTime = endDate?.getTime()
  const todayKey = getTodayDateKey()
  const todayTime = parseDateKey(todayKey)?.getTime()
  const days = buildCalendarDays(visibleMonth)
  const monthTitle = `${MONTH_LABELS[visibleMonth.getUTCMonth()]} ${visibleMonth.getUTCFullYear()}`

  function moveMonth(offset) {
    setVisibleMonth((prev) => new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + offset, 1)))
  }

  function selectDate(date) {
    const nextKey = toDateKey(date)
    const nextTime = date.getTime()
    if (todayTime && nextTime < todayTime) return

    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      onDateRangeChange('start', nextKey)
      onDateRangeChange('end', '')
      return
    }

    if (startTime && nextTime < startTime) {
      onDateRangeChange('start', nextKey)
      onDateRangeChange('end', '')
      return
    }

    onDateRangeChange('end', nextKey)
  }

  function clearRange() {
    onDateRangeChange('start', '')
    onDateRangeChange('end', '')
  }

  return (
    <div className="custom-datePicker">
      <div className="date-calendar">
        <div className="date-pickerToolbar">
          <button type="button" className="date-navBtn" onClick={() => moveMonth(-1)} aria-label="Previous month">
            ‹
          </button>
          <strong>{monthTitle}</strong>
          <button type="button" className="date-navBtn" onClick={() => moveMonth(1)} aria-label="Next month">
            ›
          </button>
        </div>

        <div className="date-weekdays">
          {WEEKDAY_LABELS.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>

        <div className="date-grid">
          {days.map((date) => {
            const key = toDateKey(date)
            const time = date.getTime()
            const isCurrentMonth = date.getUTCMonth() === visibleMonth.getUTCMonth()
            const isStart = key === dateRange.start
            const isEnd = key === dateRange.end
            const isInRange = startTime && endTime && time > startTime && time < endTime
            const isToday = key === todayKey
            const isPast = todayTime && time < todayTime

            return (
              <button
                type="button"
                className={[
                  'date-day',
                  isCurrentMonth ? '' : 'is-muted',
                  isStart ? 'is-start' : '',
                  isEnd ? 'is-end' : '',
                  isInRange ? 'is-range' : '',
                  isToday ? 'is-today' : '',
                  isPast ? 'is-disabled' : '',
                ].filter(Boolean).join(' ')}
                key={key}
                onClick={() => selectDate(date)}
                disabled={isPast}
              >
                {date.getUTCDate()}
              </button>
            )
          })}
        </div>
      </div>

      <div className="date-rangeSummary" aria-label="Selected travel date range">
        <div className="date-summaryItem">
          <span>Earliest departure</span>
          <strong>{dateRange.start ? formatDateLabel(dateRange.start) : 'Select start'}</strong>
        </div>
        <div className="date-summaryItem">
          <span>Latest departure</span>
          <strong>{dateRange.end ? formatDateLabel(dateRange.end) : 'Select end'}</strong>
        </div>
        {(dateRange.start || dateRange.end) && (
          <button type="button" onClick={clearRange}>Clear</button>
        )}
        <button type="button" onClick={onAddRange} disabled={!dateRange.start || !dateRange.end}>
          Add range
        </button>
      </div>
    </div>
  )
}

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
            <div className="date-panelHeader">
              <span>Choose departure dates</span>
              <p className="hint">This range tracks departure dates only, not a return-date selection.</p>
            </div>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              onAddRange={onAddRange}
            />

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

          <div className="search-grid">
            <label className="field-card">
              <span>Notify me when price drops below:</span>
              <input name="targetPrice" type="number" min="0" value={configForm.targetPrice} onChange={onChange} />
            </label>
          </div>

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
