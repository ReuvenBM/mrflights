export function HowToUse() {
  return (
    <section className="how-to-use">
      <h1>How to Use mrFlights</h1>

      <p>
        mrFlights helps you monitor flight routes over time without repeatedly searching the same trip.
      </p>

      <ol>
        <li>Choose your airports, travel dates.</li>
        <li>Add the route to your watchlist.</li>
        <li>mrFlights regularly collects matching flight options and stores snapshots.</li>
        <li>Review your snapshots to compare prices and flight quality over time.</li>
        <li>Use the information as a starting point before booking with the airline or travel provider.</li>
      </ol>

      <p>
        Flight prices, schedules, seat availability, and booking conditions can change at any time.
        Always verify the latest details before making a purchase.
      </p>

      <h2>How Recommendations Work</h2>

      <p>
        mrFlights analyzes the flight options it finds over time and provides a recommendation for each watched trip.
      </p>

      <p>Recommendations are based on factors such as:</p>

      <ul>
        <li>Current price compared to recent prices.</li>
        <li>Price trends over time.</li>
        <li>Time remaining until departure.</li>
        <li>Flight quality indicators such as duration, stops, and layovers.</li>
        <li>Availability and consistency of matching flight options.</li>
      </ul>

      <p>
        Recommendations are intended as guidance only and do not guarantee future price movements.
      </p>

      <h2>Price Alerts</h2>

      <p>
        You can optionally set a target price for a watched trip.
      </p>

      <p>
        When mrFlights finds a flight option at or below your target price, you will receive an alert.
      </p>

      <p>
        Price alerts are separate from the recommendation system:
      </p>

      <ul>
        <li>A flight may trigger a price alert even if the recommendation is not "Buy Now".</li>
        <li>A recommendation may suggest a good opportunity even if your target price has not been reached.</li>
      </ul>

      <p>
        This allows you to combine your personal budget with mrFlights&apos; market analysis.
      </p>
    </section>
  )
  
}