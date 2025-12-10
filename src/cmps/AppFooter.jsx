export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="footer-brand">
        <span className="logo">mrFlights</span>
        <small>Flight deals monitor</small>
      </div>
      <div className="footer-links">
        <a href="mailto:support@mrflights.app">Support</a>
        <a href="https://amadeus.com" target="_blank" rel="noreferrer">Amadeus</a>
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </div>
      <div className="footer-copy">© {year} mrFlights</div>
    </footer>
  )
}
