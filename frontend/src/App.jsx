import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
const [subcontractorForm, setSubcontractorForm] = useState({
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  services: "",
});

const [subcontractorMessage, setSubcontractorMessage] = useState("");
const [subcontractorLoading, setSubcontractorLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("alif_token");

    if (!token) {
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired.");
        }

        setCurrentUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("alif_token");
      });
  }, []);

  function handleAuthInput(event) {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    const isRegistering = authMode === "register";
    const endpoint = isRegistering
      ? "/api/users/register"
      : "/api/auth/login";

    const body = isRegistering
  ? {
      name: authForm.name,
      email: authForm.email,
      password: authForm.password,
    }
  : {
      email: authForm.email,
      password: authForm.password,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      if (isRegistering) {
        setAuthMode("login");
        setAuthForm({
          name: "",
          email: authForm.email,
          password: "",
        });
        setAuthMessage("Registration successful. Please log in.");
      } else {
        localStorage.setItem("alif_token", data.token);
        setCurrentUser(data.user);
        setAuthMessage("Login successful.");
        setAuthForm({
          name: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("alif_token");
    setCurrentUser(null);
    setAuthMessage("You have been logged out.");
  }
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

async function handleSubcontractorSubmit(event) {
  event.preventDefault();
  setSubcontractorLoading(true);
  setSubcontractorMessage("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/subcontractors/apply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subcontractorForm,
          services: subcontractorForm.services
            .split(",")
            .map((service) => service.trim())
            .filter(Boolean),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to submit application."
      );
    }

    setSubcontractorMessage(
      "Application submitted successfully for review."
    );

    setSubcontractorForm({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      services: "",
    });
  } catch (error) {
    setSubcontractorMessage(error.message);
  } finally {
    setSubcontractorLoading(false);
  }
}
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
          <a href="#account">Account</a>
          <a href="#contact">Contact Us</a>
        </nav>
      </header>
<section className="auth-panel section" id="account">
  {currentUser ? (
    <div>
      <p className="eyebrow">Signed in</p>
      <h2>Welcome, {currentUser.name || currentUser.email}</h2>
      <p>Account role: {currentUser.role}</p>
      <button className="button" type="button" onClick={handleLogout}>
        Log out
      </button>
    </div>
  ) : (
    <div>
      <p className="eyebrow">Account access</p>
      <h2>{authMode === "login" ? "Log in" : "Register"}</h2>

      <form className="auth-form" onSubmit={handleAuthSubmit}>
        {authMode === "register" && (
          <label>
            Name
            <input
              name="name"
              value={authForm.name}
              onChange={handleAuthInput}
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={authForm.email}
            onChange={handleAuthInput}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={authForm.password}
            onChange={handleAuthInput}
            minLength={8}
            required
          />
        </label>

        <button className="button" type="submit" disabled={authLoading}>
          {authLoading
            ? "Please wait..."
            : authMode === "login"
              ? "Log in"
              : "Register"}
        </button>
      </form>

      <button
        className="text-button"
        type="button"
        onClick={() => {
          setAuthMode(authMode === "login" ? "register" : "login");
          setAuthMessage("");
        }}
      >
        {authMode === "login"
          ? "Need an account? Register"
          : "Already registered? Log in"}
      </button>

      {authMessage && <p className="auth-message">{authMessage}</p>}
    </div>
  )}
</section>
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
    Submit your business information for review by the ALIF team.
  </p>

  <form
    className="subcontractor-form"
    onSubmit={handleSubcontractorSubmit}
  >
    <label>
      Company name
      <input
        value={subcontractorForm.companyName}
        onChange={(event) =>
          setSubcontractorForm({
            ...subcontractorForm,
            companyName: event.target.value,
          })
        }
        required
      />
    </label>

    <label>
      Contact name
      <input
        value={subcontractorForm.contactName}
        onChange={(event) =>
          setSubcontractorForm({
            ...subcontractorForm,
            contactName: event.target.value,
          })
        }
        required
      />
    </label>

    <label>
      Email
      <input
        type="email"
        value={subcontractorForm.email}
        onChange={(event) =>
          setSubcontractorForm({
            ...subcontractorForm,
            email: event.target.value,
          })
        }
        required
      />
    </label>

    <label>
      Phone
      <input
        type="tel"
        value={subcontractorForm.phone}
        onChange={(event) =>
          setSubcontractorForm({
            ...subcontractorForm,
            phone: event.target.value,
          })
        }
        required
      />
    </label>

    <label>
      Business address
      <textarea
        rows="3"
        value={subcontractorForm.address}
        onChange={(event) =>
          setSubcontractorForm({
            ...subcontractorForm,
            address: event.target.value,
          })
        }
        required
      />
    </label>

    <label>
      Services offered
      <input
        placeholder="Example: Lawn care, Cleaning services"
        value={subcontractorForm.services}
        onChange={(event) =>
          setSubcontractorForm({
            ...subcontractorForm,
            services: event.target.value,
          })
        }
      />
    </label>

    <button
      className="button"
      type="submit"
      disabled={subcontractorLoading}
    >
      {subcontractorLoading
        ? "Submitting..."
        : "Submit application"}
    </button>
  </form>

  {subcontractorMessage && (
    <p className="auth-message">{subcontractorMessage}</p>
  )}
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
          <p>Email: alifbdus@gmail.com</p>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Alif Solution & Consulting Service LLC</p>
      </footer>
    </div>
  );
}

export default App;