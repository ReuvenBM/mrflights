import { useMemo, useState } from 'react'
import {
  getAirportOptions,
  buildAirportMap,
  normalizeCodes,
  serializeCodes,
  filterAirportOptions,
  codesToChips,
  isKnownCode,
} from '../services/airport.service'


export function AirportMultiSelect({ name, value, onChange, placeholder }) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const options = useMemo(() => getAirportOptions(), [])
  const byCode = useMemo(() => buildAirportMap(options), [options])

  const selectedCodes = useMemo(() => normalizeCodes(value), [value])
  const selectedUpper = useMemo(
    () => selectedCodes.map((c) => String(c).toUpperCase()),
    [selectedCodes]
  )

  const selected = useMemo(() => codesToChips(selectedCodes, byCode), [selectedCodes, byCode])
  const filtered = useMemo(() => filterAirportOptions(query, options), [query, options])

  function emitCodes(nextCodes) {
    setError('')
    onChange({ target: { name, value: serializeCodes(nextCodes) } })
  }

  function addCode(code) {
    const upper = String(code).toUpperCase()
    if (!isKnownCode(upper, byCode)) return false
    if (selectedUpper.includes(upper)) return true

    emitCodes([...selectedCodes, upper])
    setQuery('')
    return true
  }

  function removeCode(code) {
    const upper = String(code).toUpperCase()
    const next = selectedCodes.filter((c) => String(c).toUpperCase() !== upper)
    emitCodes(next)
  }

  function commitTypedValue() {
    const q = query.trim()
    if (!q) return

    const maybeCode = q.toUpperCase()
    if (addCode(maybeCode)) return

    if (filtered.length === 1) {
      addCode(filtered[0].code)
      return
    }

    setError('Choose from the list')
  }

  function onKeyDown(ev) {
    if (ev.key === 'Enter' || ev.key === ',') {
      ev.preventDefault()
      commitTypedValue()
    }
    if (ev.key === 'Escape') {
      setQuery('')
      setError('')
    }
  }

  return (
    <div className="airport-multiselect">
      <div className="chips">
        {selected.map((s) => (
          <span className="chip" key={s.code} title={s.code}>
            {s.label}
            <button
              type="button"
              onMouseDown={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
              }}
              onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation()
                removeCode(s.code)
              }}
            >
              ×
            </button>
          </span>
        ))}

        <input
          value={query}
          placeholder={placeholder}
          onFocus={() => setError('')}
          onBlur={() => {
            setTimeout(() => {
              commitTypedValue()
              setOpen(false)
            }, 120)
          }}
          onChange={(ev) => {
            setQuery(ev.target.value)
            setError('')
          }}
          onClick={(ev) => {
            setQuery(ev.target.value)
            setError('')
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      {open && (
        <div className="airport-suggestions" style={{ maxHeight: 260, overflowY: 'auto' }}>
          {filtered.slice(0, 200).map((o) => {
            const disabled = selectedUpper.includes(String(o.code).toUpperCase())
            return (
              <button
                key={o.code}
                type="button"
                className="suggestion"
                onMouseDown={(ev) => {
                  ev.preventDefault()
                  ev.stopPropagation()
                }} onClick={() => addCode(o.code)}
                disabled={disabled}
                title={o.code}
              >
                {o.label}
              </button>
            )
          })}

          {!filtered.length && <div className="hint">No matches</div>}
        </div>
      )}

      {!!error && <div className="hint error">{error}</div>}
    </div>
  )
}