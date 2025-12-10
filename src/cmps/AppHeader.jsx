import { NavLink } from "react-router-dom"
import { useUser } from "../store/UserContext"

export function AppHeader() {
  const { user } = useUser()

  return (
    <header className="app-header">
      <div className="brand">
        <NavLink to="/">mrFlights</NavLink>
      </div>
      <nav>
        <NavLink to="/">Home</NavLink>
        {!user && <NavLink to="/auth">Login / Signup</NavLink>}
        {user && <NavLink to="/profile">Profile</NavLink>}
      </nav>
    </header>
  )
}
