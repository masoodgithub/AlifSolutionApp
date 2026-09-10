function App() {
  const services = [
    "Property preservation",
    "Property maintenance",
    "Inspections",
    "Lawn care",
    "Cleaning services",
    "Repairs",
    "Commercial services",
    "Foreclosure-related services",
    "Winterization",
    "Emergency maintenance",
  ];

  return (
    <div className="app">
      <header className="site-header">
        <a className="logo" href="#home" aria-label="ALIF home">
          ALIF
        </a>

        <nav className="navigation" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#about">About Us</a>
          <a href="#services">Services</a>
          <a href="#areas">Service Areas</a>
          <a href="#subcontractor">Subcontractors</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact Us</a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero section">
          <div className="hero-content">
            <p className="eyebrow">ALIF Solution & Consulting Service LLC</p>
            <h1>Reliable property solutions across the United States.</h1>
            <p>
              Professional property maintenance, preservation, inspections,
              and support services for residential and commercial needs.
            </p>
            <a className="button" href="#contact">
              Contact ALIF
            </a>
          </div>
        </section>

        <section id="about" className="section content-section">
          <p className="eyebrow">About Us</p>
          <h2>Practical service. Clear communication. Dependable support.</h2>
          <p>
            ALIF Solution & Consulting Service LLC is based in Sterling,
            Virginia, and serves clients throughout the United States.
          </p>
        </section>

        <section id="services" className="section services-section">
          <p className="eyebrow">What We Do</p>
          <h2>Our services</h2>

          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service}>
                <h3>{service}</h3>
                <p>
                  Contact ALIF to discuss your property service requirements.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="areas" className="section highlight-section">
          <p className="eyebrow">Service Areas</p>
          <h2>Serving clients across the United States</h2>
          <p>
            Our service-area information can be expanded later as operations
            and coverage are organized.
          </p>
        </section>

        <section id="subcontractor" className="section content-section">
          <p className="eyebrow">Subcontractor Registration</p>
          <h2>Work with ALIF</h2>
          <p>
            Registered companies will be able to submit business information,
            required documents, completed-task photos, and invoices for
            administrator review.
          </p>
          <button className="button" type="button">
            Registration will be added
          </button>
        </section>

        <section id="reviews" className="section highlight-section">
          <p className="eyebrow">Customer Reviews</p>
          <h2>Share your experience</h2>
          <p>
            Customers will be able to submit reviews without creating an
            account. Review information will be stored securely for future
            contact and company response.
          </p>
          <button className="button" type="button">
            Review form will be added
          </button>
        </section>

        <section id="contact" className="section contact-section">
          <p className="eyebrow">Contact Us</p>
          <h2>Let’s discuss your property needs</h2>
          <p>21785 Baldwin Sq, Sterling, Virginia, USA</p>
          <p>Phone: 760-780-2603</p>
          <p>Email: alifbdus@mail.com</p>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Alif Solution & Consulting Service LLC</p>
      </footer>
    </div>
  );
}

export default App;