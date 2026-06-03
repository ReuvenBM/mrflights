import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userService } from '../services/user.service'
import { useUser } from '../store/UserContext'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'

export function AuthPage() {
  const { setUser } = useUser()
  const navigate = useNavigate()
  const googleButtonRef = useRef(null)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(Boolean(googleClientId))
  const [googleError, setGoogleError] = useState('')

  const onGoogleCredential = useCallback(async (credential) => {
    if (!credential) {
      showErrorMsg('Google login failed')
      return
    }
    setLoading(true)
    try {
      const user = await userService.googleLogin(credential)
      setUser(user)
      showSuccessMsg('Logged in')
      navigate('/')
    } catch (err) {
      console.error(err)
      showErrorMsg(err.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }, [navigate, setUser])

  useEffect(() => {
    if (!googleClientId) return

    function renderGoogleButton() {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (res) => onGoogleCredential(res?.credential)
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleButtonRef.current.offsetWidth || 320
      })
      setGoogleLoading(false)
      setGoogleError('')
    }

    const scriptId = 'google-identity-services'
    const existingScript = document.getElementById(scriptId)
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton)
      renderGoogleButton()
      return () => existingScript.removeEventListener('load', renderGoogleButton)
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.addEventListener('load', renderGoogleButton)
    script.addEventListener('error', () => {
      setGoogleLoading(false)
      setGoogleError('Google login failed to load')
    })
    document.head.appendChild(script)

    return () => script.removeEventListener('load', renderGoogleButton)
  }, [googleClientId, onGoogleCredential])

  return (
    <main className="page narrow">
      <section className="panel">
        <header className="panel-header">
          <h2>Login</h2>
          <Link to="/">Back home</Link>
        </header>
        {!googleClientId && <p>Google login is not configured.</p>}
        {googleError && <p>{googleError}</p>}
        {googleLoading && <p>Loading Google login...</p>}
        {googleClientId && <div ref={googleButtonRef} style={{ margin: '1rem 0', minHeight: 44 }} />}
        {loading && <p>Please wait...</p>}
      </section>
    </main>
  )
}
