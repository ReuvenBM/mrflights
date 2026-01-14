import { Link } from 'react-router-dom'

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="footer-brand">
        <span className="logo">mrFlights</span>
        <small>Flight deals monitor</small>
      </div>
      <div className="footer-links">
        <a href="mailto:reuven2408@gmail.com">Support</a>
        <a href="https://www.google.com/travel/flights" target="_blank" rel="noreferrer">Google Flights</a>
        <Link to="/how-to-use">How to use</Link>
      </div>
      <div className="footer-copy">© {year} mrFlights</div>
    </footer>
  )
}
