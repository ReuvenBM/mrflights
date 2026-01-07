import { useEffect, useMemo, useState, useRef } from 'react'
import { dealsService } from '../services/deals.service'
import { userService } from '../services/user.service'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { useUser } from '../store/UserContext'
import { Link } from 'react-router-dom'
import { SearchPreferencesForm } from '../cmps/SearchPreferencesForm'
import { SchedulePanel } from '../cmps/SchedulePanel'
import { parseList, generateDatesBetween } from '../services/deals.utils'
import { io } from 'socket.io-client'
import { Algorithm } from '../cmps/Algorithm'

export function HomePage() {
  const { user, setUser } = useUser()
  const [configForm, setConfigForm] = useState({
    origins: '',
    dests: '',
    dates: [],
    currency: '',
    maxNonstop: '',
    maxOnestop: '',
    maxHours: ''
    //intervalMinutes: ''
  })
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [status, setStatus] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [scheduleSupported, setScheduleSupported] = useState(true)
  const [grouped, setGrouped] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [running, setRunning] = useState(false)
  const [updatingSchedule, setUpdatingSchedule] = useState(false)

  const configPayload = useMemo(() => normalizeConfig(configForm), [configForm])
  const datesList = useMemo(() => (Array.isArray(configForm.dates) ? configForm.dates : parseList(configForm.dates)), [configForm.dates])
  useEffect(() => {
    if (!user) return
    refreshStatus()
    //refreshSchedule()
  }, [user])

  useEffect(() => {
    if (!user) return

    const baseUrl = import.meta.env.VITE_DEALS_API_URL || 'http://localhost:3030'

    const socket = io(baseUrl, {
      withCredentials: true,
    })

    socket.on('connect', () => {
      if (user?._id) socket.emit('register-user', user._id)
    })

    socket.on('deals:update', (payload) => {
      if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'grouped')) return
      setGrouped(payload.grouped)
    })

    return () => socket.disconnect()
  }, [user])

  function handleConfigChange(ev) {
    const { name, value } = ev.target
    setConfigForm((prev) => ({ ...prev, [name]: value }))
  }

  function onRemoveDate(date) {
    setConfigForm((prev) => {
      const list = Array.isArray(prev.dates) ? prev.dates : parseList(prev.dates)
      return { ...prev, dates: list.filter((d) => d !== date) }
    })
  }

  function onDateRangeChange(field, value) {
    setDateRange((prev) => ({ ...prev, [field]: value }))
  }

  function onAddRange(ev) {
    ev.preventDefault()
    if (!dateRange.start || !dateRange.end) return
    const list = generateDatesBetween(dateRange.start, dateRange.end)
    addDates(list)
    setDateRange({ start: '', end: '' })
  }

  function addDates(list) {
    if (!list.length) return
    setConfigForm((prev) => {
      const existing = new Set(Array.isArray(prev.dates) ? prev.dates : parseList(prev.dates))
      list.forEach((d) => existing.add(d))
      const next = [...existing].sort()
      return { ...prev, dates: next }
    })
  }

  async function refreshStatus() {
    setLoadingStatus(true)
    try {
      const res = await dealsService.getStatus()
      const data = res?.status || res
      setStatus(data)
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Status error')
    } finally {
      setLoadingStatus(false)
    }
  }

  // async function refreshSchedule() {
  //   try {
  //     const res = await dealsService.getSchedule()
  //     setSchedule(res)
  //   } catch (err) {
  //     console.error(err)
  //     if (err?.status === 404) setScheduleSupported(false)
  //   }
  // }

  async function savePreferences() {
    const res = await dealsService.saveConfig(configPayload)
    if (res?.ok === false) throw new Error(res.error || 'Save failed')

    if (user) {
      const updated = userService.saveLocalUser({
        ...user,
        flightConfig: res?.config || configPayload,
      })
      setUser(updated)
    }

    return res
  }



  async function onRun() {
    //console.log('onRun clicked, configPayload =', configPayload)
    setRunning(true)
    try {
      await savePreferences()
      const watchItemPayload = buildWatchItemPayload(configPayload)
      console.log(watchItemPayload)
      const res = await dealsService.runOnce(watchItemPayload)
      if (res?.ok === false) throw new Error(res.error || 'Run failed')
      if (!res?.runId) throw new Error('Run failed')
      showSuccessMsg('Run started')
      await refreshStatus()
      //await refreshSchedule()
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Run failed')
    } finally {
      setRunning(false)
    }
  }

  async function onStartSchedule() {
    setUpdatingSchedule(true)
    try {
      await savePreferences()

      const res = await dealsService.startSchedule(configPayload)
      if (res?.ok === false) throw new Error(res.error || 'Schedule failed')

      showSuccessMsg('Scheduler started')
      await refreshSchedule()
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Start schedule failed')
    } finally {
      setUpdatingSchedule(false)
    }
  }

  async function onStopSchedule() {
    setUpdatingSchedule(true)
    try {
      await dealsService.stopSchedule()
      showSuccessMsg('Scheduler stopped')
      await refreshSchedule()
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Stop schedule failed')
    } finally {
      setUpdatingSchedule(false)
    }
  }
  function normalizeConfig(form) {
    const toNum = (v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : undefined
    }

    return {
      origins: parseList(form.origins),
      dests: parseList(form.dests),
      dates: Array.isArray(form.dates) ? form.dates : parseList(form.dates),
      currency: form.currency || 'USD',
      maxNonstop: toNum(form.maxNonstop),
      maxOnestop: toNum(form.maxOnestop),
      maxHours: toNum(form.maxHours),
      //intervalMinutes: toNum(form.intervalMinutes)
    }
  }

  function buildWatchItemPayload(config) {
    const origin = Array.isArray(config.origins) ? config.origins[0] : config.origins
    const dest = Array.isArray(config.dests) ? config.dests[0] : config.dests
    const dates = Array.isArray(config.dates) ? config.dates : parseList(config.dates)

    return {
      route: { origin, dest },
      dates,
      filters: {
        currency: config.currency,
        maxNonstop: config.maxNonstop,
        maxOnestop: config.maxOnestop,
        maxHours: config.maxHours
      }
    }
  }

  if (!user) {
    return (
      <main className="page">
        <section className="panel">
          <h2>Welcome</h2>
          <p>Please <Link to="/auth">log in</Link> to set preferences and view flight deals.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <SearchPreferencesForm
        configForm={configForm}
        datesList={datesList}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onAddRange={onAddRange}
        onRemoveDate={onRemoveDate}
        onChange={handleConfigChange}
        onRun={onRun}
        onStartSchedule={onStartSchedule}
        onStopSchedule={onStopSchedule}
        running={running}
        updatingSchedule={updatingSchedule}
        scheduleSupported={scheduleSupported}
        //canStartSchedule={!!configPayload.intervalMinutes}
      />

      {/* <SchedulePanel
        schedule={schedule}
        supported={scheduleSupported}
        loading={updatingSchedule}
        onRefresh={refreshSchedule}
      /> */}


      <Algorithm />

      {!grouped || !Object.keys(grouped.routes || {}).length ? (
        <section className="panel">
          <h3>No results yet</h3>
        </section>
      ) : (
        Object.entries(grouped.routes).map(([routeKey, route]) => (
          <section className="panel" key={routeKey}>
            <h3>{route.origin} → {route.dest}</h3>
            {Object.entries(route.dates || {}).map(([date, bucket]) => (
              <div key={date}>
                <h4>{date}</h4>
                <p>Min price: {bucket.minPrice ?? 'N/A'} | Count: {bucket.count ?? 0}</p>
                {Array.isArray(bucket.flightOptions) && bucket.flightOptions.length ? (
                  <ul>
                    {bucket.flightOptions.map((option) => (
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
          </section>
        ))
      )}
    </main>
  )
}
