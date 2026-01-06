import { useEffect, useState } from 'react'
import { useUser } from '../store/UserContext'
import { dealsService } from '../services/deals.service'
import { userService } from '../services/user.service'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { Link } from 'react-router-dom'
import { formatVal } from '../services/deals.utils'

export function ProfilePage() {
  const { user, logout, setUser } = useUser()
  const [profileForm, setProfileForm] = useState(initProfile(user))
  const [credForm, setCredForm] = useState({ clientId: '', clientSecret: '' })
  const [savingCreds, setSavingCreds] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    setProfileForm(initProfile(user))
  }, [user])

  if (!user) {
    return (
      <main className="page narrow">
        <section className="panel">
          <h2>Please log in</h2>
          <p>You need to log in to edit your details.</p>
          <Link to="/auth">Go to login</Link>
        </section>
      </main>
    )
  }

  function handleCredChange(ev) {
    const { name, value } = ev.target
    setCredForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleProfileChange(ev) {
    const { name, value } = ev.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  async function onSaveProfile(ev) {
    ev.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await userService.updateProfile(profileForm)
      setUser(updated)
      showSuccessMsg('Profile updated')
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  async function onSaveCredentials(ev) {
    ev.preventDefault()
    setSavingCreds(true)
    try {
      const res = await dealsService.saveCredentials(credForm)
      if (res?.ok === false) throw new Error(res.error || 'Save failed')
      showSuccessMsg('Credentials updated')
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Save failed')
    } finally {
      setSavingCreds(false)
    }
  }

  async function onLogout() {
    try {
      await logout()
      showSuccessMsg('Logged out')
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Logout failed')
    }
  }

  return (
    <main className="page narrow">
      <section className="panel">
        <header className="panel-header">
          <h2>Profile</h2>
          <button onClick={onLogout}>Logout</button>
        </header>
        <form className="form" onSubmit={onSaveProfile}>
          <div className="double">
            <label>
              First name
              <input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} required />
            </label>
            <label>
              Last name
              <input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} required />
            </label>
          </div>
          <label>
            Email
            <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} required />
          </label>
          {/* <label>
            Username
            <input name="username" value={profileForm.username} onChange={handleProfileChange} />
          </label> */}
          <label>
            Phone
            <input name="phone" value={profileForm.phone} onChange={handleProfileChange} />
          </label>
          <button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button>
        </form>
      </section>

      {/* <section className="panel">
        <header className="panel-header">
          <h2>Saved Flight Config</h2>
        </header>
        {user.flightConfig ? (
          <div className="status-grid">
            <div><strong>Origins:</strong> {formatList(user.flightConfig.origins)}</div>
            <div><strong>Dests:</strong> {formatList(user.flightConfig.dests)}</div>
            <div><strong>Dates:</strong> {formatList(user.flightConfig.dates)}</div>
            <div><strong>Currency:</strong> {formatVal(user.flightConfig.currency)}</div>
            <div><strong>Max nonstop:</strong> {formatVal(user.flightConfig.maxNonstop)}</div>
            <div><strong>Max one-stop:</strong> {formatVal(user.flightConfig.maxOnestop)}</div>
            <div><strong>Max hours:</strong> {formatVal(user.flightConfig.maxHours)}</div>
          </div>
        ) : (
          <p>No flight config saved yet.</p>
        )}
      </section> */}

      {/* <section className="panel">
        <header className="panel-header">
          <h2>Amadeus Credentials</h2>
        </header>
        <form className="form" onSubmit={onSaveCredentials}>
          <label>
            Client ID
            <input name="clientId" value={credForm.clientId} onChange={handleCredChange} required />
          </label>
          <label>
            Client Secret
            <input name="clientSecret" value={credForm.clientSecret} onChange={handleCredChange} required />
          </label>
          <button type="submit" disabled={savingCreds}>{savingCreds ? 'Saving…' : 'Save credentials'}</button>
        </form>
      </section> */}
    </main>
  )
}

function initProfile(user) {
  if (!user) return {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
    //username: '',
    //imgUrl: ''
  }
  return {
    _id: user._id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    //username: user.username || '',
    //imgUrl: user.imgUrl || ''
  }
}

function formatList(val) {
  if (!val) return '—'
  if (Array.isArray(val)) return val.join(', ')
  return formatVal(val)
}
