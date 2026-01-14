import './App.css'
import { HomePage } from './pages/HomePage'
import { AppHeader } from "./cmps/AppHeader"
import { AppFooter } from "./cmps/AppFooter"
import { UserMsg } from "./cmps/UserMsg"
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthPage } from "./pages/AuthPage"
import { ProfilePage } from "./pages/ProfilePage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { UserProvider } from "./store/UserContext"
import { useSessionTracking } from "./hooks/useSessionTracking"
import { HowToUse } from './cmps/HowToUse'

function SessionTracking() {
  useSessionTracking()
  return null
}

function App() {
  return (
    <UserProvider>
      <SessionTracking />
      <Router>
        <div className="app-layout">
          <AppHeader />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/signup" element={<Navigate to="/auth" replace />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <AppFooter />
          <UserMsg />
        </div>
      </Router>
    </UserProvider>
  )
}

export default App
