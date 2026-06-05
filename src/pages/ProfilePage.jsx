import { useEffect, useState } from 'react'
import { useUser } from '../store/UserContext'
import { userService } from '../services/user.service'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { getUserErrorMessage } from '../services/http.service'
import { Link } from 'react-router-dom'

export function ProfilePage() {
  const { user, logout, setUser } = useUser()
  const [profileForm, setProfileForm] = useState(initProfile(user))
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
      showErrorMsg(getUserErrorMessage(err, 'Could not update your profile. Please check your details and try again.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function onLogout() {
    try {
      await logout()
      showSuccessMsg('Logged out')
    } catch (err) {
      console.error(err)
      showErrorMsg(getUserErrorMessage(err, 'Could not log out. Please try again.'))
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
