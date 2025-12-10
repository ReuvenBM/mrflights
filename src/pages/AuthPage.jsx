import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../services/user.service'
import { useUser } from '../store/UserContext'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'

export function AuthPage() {
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    amadeusKey: '',
    amadeusSecret: '',
    imgUrl: ''
  })

  function handleChange(ev) {
    const { name, value } = ev.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const payload = form.email
          ? { email: form.email, password: form.password }
          : { username: form.username, password: form.password }
        const user = await userService.login(payload)
        setUser(user)
        showSuccessMsg('Logged in')
      } else {
        const user = await userService.signup(form)
        setUser(user)
        showSuccessMsg('Signed up')
      }
      navigate('/')
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <section className="panel">
        <header className="panel-header">
          <h2>{mode === 'login' ? 'Login' : 'Signup'}</h2>
          <Link to="/">Back home</Link>
        </header>
        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Signup
          </button>
        </div>
        <form className="form" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <div className="double">
              <label>
                First name *
                <input name="firstName" value={form.firstName} onChange={handleChange} required />
              </label>
              <label>
                Last name *
                <input name="lastName" value={form.lastName} onChange={handleChange} required />
              </label>
            </div>
          )}
          <label>
            Email {mode === 'login' ? '(or username)' : '*'}
            <input name="email" value={form.email} onChange={handleChange} type="email" required={mode === 'signup'} />
          </label>
          <label>
            Password *
            <input name="password" value={form.password} onChange={handleChange} type="password" required />
          </label>
          {mode === 'signup' && (
            <>
              <div className="double">
                <label>
                  Amadeus Key *
                  <input name="amadeusKey" value={form.amadeusKey} onChange={handleChange} required />
                </label>
                <label>
                  Amadeus Secret *
                  <input name="amadeusSecret" value={form.amadeusSecret} onChange={handleChange} required />
                </label>
              </div>
            </>
          )}
          <button type="submit" disabled={loading}>{loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Signup')}</button>
        </form>
      </section>
    </main>
  )
}
