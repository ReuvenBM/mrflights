import { useEffect, useMemo, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { dealsService } from '../services/deals.service'
import { watchItemService } from '../services/watchItem.service'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { useUser } from '../store/UserContext'
import { Link } from 'react-router-dom'
import { SearchPreferencesForm } from '../cmps/SearchPreferencesForm'
import { parseList, generateDatesBetween } from '../services/deals.utils'
import { SnapshotsList } from '../cmps/SnapshotsList'

const SNAPSHOT_POLL_MAX_ATTEMPTS = 8
const SNAPSHOT_POLL_INTERVAL_MS = 1500
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : undefined
const RECOMMENDATION_SUMMARY_ITEMS = [
  { action: 'BUY', label: 'Buy now' },
  { action: 'GOOD_DEAL', label: 'Good deal' },
  { action: 'WATCH', label: 'Worth watching' },
  { action: 'WAIT', label: 'Wait' },
]

const getRecommendationClass = (action) => {
  const key = String(action || '').trim().toLowerCase().replaceAll('_', '-')
  return key ? ` recommendation-${key}` : ''
}

export function HomePage() {
  const { user, userLoading } = useUser()
  const [configForm, setConfigForm] = useState({
    origins: '',
    dests: '',
    dates: [],
    currency: '',
    maxNonstop: '',
    maxOnestop: '',
    maxHours: '',
    targetPrice: ''
    //intervalMinutes: ''
  })
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [, setStatus] = useState(null)
  const [snapshots, setSnapshots] = useState(null)
  const [watchItems, setWatchItems] = useState([])
  const [, setSnapshotUpdatedAt] = useState(null)
  const snapshotUpdatedAtRef = useRef(null)
  const [, setLoadingStatus] = useState(false)
  const [running, setRunning] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(true)
  const didSetInitialPreferences = useRef(false)

  const configPayload = useMemo(() => normalizeConfig(configForm), [configForm])
  const datesList = useMemo(() => (Array.isArray(configForm.dates) ? configForm.dates : parseList(configForm.dates)), [configForm.dates])
  const watchItemsById = (Array.isArray(watchItems) ? watchItems : []).reduce((acc, item) => {
    if (item?._id) acc[String(item._id)] = item
    return acc
  }, {})
  const routeCount = snapshots
    ? new Set(Object.values(snapshots).map((snapshot) => `${snapshot.route?.origin}-${snapshot.route?.dest}`)).size
    : 0
  const recommendationCounts = Object.values(snapshots || {}).reduce((acc, snapshot) => {
    const recommendation = snapshot?.watchItemId
      ? watchItemsById[String(snapshot.watchItemId)]?.recommendation
      : null
    const action = String(recommendation?.action || '').trim().toUpperCase()
    if (Object.prototype.hasOwnProperty.call(acc, action)) acc[action] += 1
    return acc
  }, RECOMMENDATION_SUMMARY_ITEMS.reduce((acc, item) => ({ ...acc, [item.action]: 0 }), {}))

  useEffect(() => {
    if (!user) return
    refreshStatus()
    refreshSnapshot()
    refreshWatchItems()
  }, [user])

  useEffect(() => {
    if (!user?._id) return

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    })

    socket.on('connect', () => {
      socket.emit('register-user', user._id)
    })

    socket.on('deals:update', (payload) => {
      if (!payload?.refresh) return
      const incomingUpdatedAt =
        payload.updatedAt instanceof Date
          ? payload.updatedAt.getTime()
          : typeof payload.updatedAt === 'string'
            ? Date.parse(payload.updatedAt)
            : payload.updatedAt
      const currentUpdatedAt = snapshotUpdatedAtRef.current
      if (Number.isFinite(incomingUpdatedAt) && Number.isFinite(currentUpdatedAt)) {
        if (incomingUpdatedAt <= currentUpdatedAt) return
      }
      refreshSnapshot()
    })

    socket.on('target-price:alert', (payload) => {
      const route = payload?.route ? `${payload.route.origin}-${payload.route.dest}` : 'Flight'
      const currency = payload?.currency ? ` ${payload.currency}` : ''
      showSuccessMsg(`${route} reached ${payload?.minPrice}${currency} target price`)
    })

    return () => socket.disconnect()
  }, [user?._id])

  useEffect(() => {
    if (didSetInitialPreferences.current) return
    if (snapshots === null) return
    const hasSnapshots = !!(snapshots && Object.keys(snapshots).length)
    setIsPreferencesOpen(!hasSnapshots)
    didSetInitialPreferences.current = true
  }, [snapshots])

  function clearSnapshotState() {
    setSnapshots(null)
    setWatchItems([])
    setSnapshotUpdatedAt(null)
    snapshotUpdatedAtRef.current = null
  }

  function handleConfigChange(ev) {
    const { name, value } = ev.target
    if (
      name === 'origins' ||
      name === 'dests' ||
      name === 'currency' ||
      name === 'maxNonstop' ||
      name === 'maxOnestop' ||
      name === 'maxHours' ||
      name === 'targetPrice'
    ) {
      clearSnapshotState()
    }
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

  async function refreshSnapshot(options = {}) {
    const { onlyIfNewerThan } = options
    const mustBeNewer = Number.isFinite(onlyIfNewerThan)

    try {
      const res = await dealsService.getSnapshot()
      if (res?.ok === false) throw new Error(res.error || 'Snapshot error')
      const nextSnapshots = res?.snapshots || {}
      const updatedAt = res?.updatedAt
      const parsedUpdatedAt =
        updatedAt instanceof Date
          ? updatedAt.getTime()
          : typeof updatedAt === 'string'
            ? Date.parse(updatedAt)
            : updatedAt

      const isNewerSnapshot = Number.isFinite(parsedUpdatedAt) && parsedUpdatedAt > onlyIfNewerThan
      if (!mustBeNewer || isNewerSnapshot) {
        setSnapshots(nextSnapshots)
      }

      if (Number.isFinite(parsedUpdatedAt)) {
        setSnapshotUpdatedAt(parsedUpdatedAt)
        snapshotUpdatedAtRef.current = parsedUpdatedAt
      }

      return {
        updatedAt: Number.isFinite(parsedUpdatedAt) ? parsedUpdatedAt : null,
        didAdvance: mustBeNewer ? isNewerSnapshot : Number.isFinite(parsedUpdatedAt)
      }
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Snapshot error')
      return { updatedAt: null, didAdvance: false }
    }
  }

  async function refreshWatchItems() {
    try {
      const res = await watchItemService.query({ status: 'ACTIVE', limit: 500, page: 1 })
      if (res?.ok === false) throw new Error(res.error || 'Watch items error')
      setWatchItems(Array.isArray(res?.watchItems) ? res.watchItems : [])
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Watch items error')
    }
  }

  async function pollForNewerSnapshot(previousUpdatedAt) {
    for (let attempt = 0; attempt < SNAPSHOT_POLL_MAX_ATTEMPTS; attempt += 1) {
      const { didAdvance } = await refreshSnapshot({ onlyIfNewerThan: previousUpdatedAt })
      if (didAdvance) return true
      if (attempt < SNAPSHOT_POLL_MAX_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, SNAPSHOT_POLL_INTERVAL_MS))
      }
    }
    return false
  }

  async function onRun() {
    //console.log('onRun clicked, configPayload =', configPayload)
    setRunning(true)
    try {
      const previousSnapshotUpdatedAt = snapshotUpdatedAtRef.current
      const watchItemPayload = buildWatchItemPayload(configPayload)
      console.log(watchItemPayload)
      const res = await dealsService.runOnce(watchItemPayload)
      if (res?.ok === false) throw new Error(res.error || 'Run failed')
      if (!res?.runId) throw new Error('Run failed')
      showSuccessMsg('Run started')
      await refreshStatus()
      await pollForNewerSnapshot(previousSnapshotUpdatedAt)
      await refreshWatchItems()
      //await refreshSchedule()
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Run failed')
    } finally {
      setRunning(false)
    }
  }

  async function onDeleteWatchItem(watchItemId) {
    if (!watchItemId) return
    try {
      const res = await dealsService.deleteWatchItem(watchItemId)
      if (res?.ok === false) throw new Error(res.error || 'Delete failed')
      await refreshSnapshot()
      await refreshWatchItems()
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Delete failed')
    }
  }

  async function onDeleteRoute(watchItemIds) {
    const ids = (Array.isArray(watchItemIds) ? watchItemIds : []).filter(Boolean)
    if (!ids.length) return
    try {
      const results = await Promise.all(ids.map((id) => dealsService.deleteWatchItem(id)))
      const failed = results.find((res) => res?.ok === false)
      if (failed) throw new Error(failed.error || 'Delete failed')
      await refreshSnapshot()
      await refreshWatchItems()
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Delete failed')
    }
  }

  function normalizeConfig(form) {
    const toNum = (v) => {
      if (v === '') return undefined
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
      targetPrice: toNum(form.targetPrice),
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
      targetPrice: config.targetPrice,
      filters: {
        currency: config.currency,
        maxNonstop: config.maxNonstop,
        maxOnestop: config.maxOnestop,
        maxHours: config.maxHours
      }
    }
  }

  if (userLoading) {
    return (
      <main className="page home-dashboard">
        <section className="panel state-panel">
          <span className="state-eyebrow">mrFlights</span>
          <h2>Loading your dashboard…</h2>
          <p>Checking your session and latest flight snapshots.</p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page home-dashboard">
        <section className="panel state-panel state-panel-hero">
          <span className="state-eyebrow">Flight deals monitor</span>
          <h1>Track the routes that matter.</h1>
          <p>Log in to set airport preferences, run a fresh search, and review saved price snapshots in one place.</p>
          <Link className="state-link" to="/auth">Log in to continue</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page home-dashboard">
      <section className="dashboard-hero">
        <div>
          <span className="state-eyebrow">Flight dashboard</span>
          <h1>Find the next route worth booking</h1>
          <p>Choose your route and travel window, then track the best flight opportunities as prices change</p>
        </div>
        <div className="dashboard-stats" aria-label="Current snapshot summary">
          <div className="dashboard-stat">
            <span>{routeCount}</span>
            <small>Routes</small>
          </div>
          {RECOMMENDATION_SUMMARY_ITEMS.map((item) => (
            <div className={`dashboard-stat${getRecommendationClass(item.action)}`} key={item.action}>
              <span>{recommendationCounts[item.action]}</span>
              <small>{item.label}</small>
            </div>
          ))}
        </div>
      </section>

      <SearchPreferencesForm
        configForm={configForm}
        datesList={datesList}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onAddRange={onAddRange}
        onRemoveDate={onRemoveDate}
        onChange={handleConfigChange}
        onRun={onRun}
        running={running}
        isOpen={isPreferencesOpen}
        onToggle={() => setIsPreferencesOpen((prev) => !prev)}
        onCollapse={() => setIsPreferencesOpen(false)}
        //canStartSchedule={!!configPayload.intervalMinutes}
      />

      <SnapshotsList
        snapshots={snapshots}
        watchItems={watchItems}
        onDeleteWatchItem={onDeleteWatchItem}
        onDeleteRoute={onDeleteRoute}
      />
    </main>
  )
}
