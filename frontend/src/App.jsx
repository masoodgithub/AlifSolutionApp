import { useEffect, useState } from "react";
import "./App.css";
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
const [pendingApplications, setPendingApplications] = useState([]);
const [approvedApplications, setApprovedApplications] = useState([]);
const [adminApplicationsLoading, setAdminApplicationsLoading] =
  useState(false);
const [adminApplicationsMessage, setAdminApplicationsMessage] =
  useState("");

useEffect(() => {
  const goHomeOnLoad = () => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    );

    document.getElementById("home")?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  };

  const timer = window.setTimeout(goHomeOnLoad, 50);

  return () => window.clearTimeout(timer);
}, []);

  useEffect(() => {
    const token = localStorage.getItem("alif_token");

    if (!token) {
      return;
    }

    useEffect(() => {
  if (currentUser?.role === "admin") {
    loadAdminApplications();
  }
}, [currentUser]);

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
async function loadAdminApplications() {
  const token = localStorage.getItem("alif_token");

  if (!token || currentUser?.role !== "admin") {
    return;
  }

  setAdminApplicationsLoading(true);
  setAdminApplicationsMessage("");

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [pendingResponse, approvedResponse] = await Promise.all([
      fetch(
        `${API_BASE_URL}/api/subcontractor-admin?status=pending`,
        { headers }
      ),
      fetch(
        `${API_BASE_URL}/api/subcontractor-admin?status=approved`,
        { headers }
      ),
    ]);

    const pendingData = await pendingResponse.json();
    const approvedData = await approvedResponse.json();

    if (!pendingResponse.ok) {
      throw new Error(
        pendingData.message || "Unable to load pending applications."
      );
    }

    if (!approvedResponse.ok) {
      throw new Error(
        approvedData.message || "Unable to load approved companies."
      );
    }

    setPendingApplications(pendingData.applications || []);
    setApprovedApplications(approvedData.applications || []);
  } catch (error) {
    setAdminApplicationsMessage(error.message);
  } finally {
    setAdminApplicationsLoading(false);
  }
}

  return (
    <div className="app">
      <header className="site-header">
        <a className="logo" href="#home" aria-label="Alif home">
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
<section className="auth-panel section account-page" id="account">
  <div className="account-form-card">
    {currentUser ? (
      <>
        <p className="eyebrow">Account access</p>
        <h2>Welcome, {currentUser.name || currentUser.email}</h2>
        <p className="account-intro">
          You are signed in to your ALIF account.
        </p>

        <dl className="account-details">
          <div className="account-detail">
            <dt>Name</dt>
            <dd>{currentUser.name || "Not provided"}</dd>
          </div>

          <div className="account-detail">
            <dt>Email</dt>
            <dd>{currentUser.email}</dd>
          </div>

          <div className="account-detail">
            <dt>Account role</dt>
            <dd>{currentUser.role}</dd>
          </div>
        </dl>

        <div className="account-actions">
          <button
            className="button page-button page-button-secondary"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </>
    ) : (
      <>
        <p className="eyebrow">Account access</p>
        <h2>{authMode === "login" ? "Log in to your account" : "Create an account"}</h2>
        <p className="account-intro">
          {authMode === "login"
            ? "Enter your email address and password to continue."
            : "Complete the form below to register for an ALIF account."}
        </p>

        <form className="auth-form styled-form" onSubmit={handleAuthSubmit}>
          {authMode === "register" && (
            <label className="form-field">
              Full name
              <input
                name="name"
                value={authForm.name}
                onChange={handleAuthInput}
                placeholder="Enter your full name"
                required
              />
            </label>
          )}

          <label className="form-field">
            Email address
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleAuthInput}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="form-field">
            Password
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleAuthInput}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          <button
            className="button page-button page-button-primary"
            type="submit"
            disabled={authLoading}
          >
            {authLoading
              ? "Please wait..."
              : authMode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <button
          className="text-button account-switch-button"
          type="button"
          onClick={() => {
            setAuthMode(authMode === "login" ? "register" : "login");
            setAuthMessage("");
          }}
        >
          {authMode === "login"
            ? "Need an account? Register here"
            : "Already have an account? Log in"}
        </button>

        {authMessage && (
          <p className="auth-message" role="status">
            {authMessage}
          </p>
        )}
      </>
    )}
  </div>
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

        <section id="services" className="section services-section p2">
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

        <section
  id="subcontractor"
  className="section content-section subcontractor-page"
>
  <div className="subcontractor-form-card">
    <p className="eyebrow">Subcontractor registration</p>
    <h2>Work with ALIF</h2>
    <p className="subcontractor-intro">
      Complete this application form to introduce your company to the ALIF
      team. We will review your submission and contact you about next steps.
    </p>

    <form
      className="subcontractor-form styled-form"
      onSubmit={handleSubcontractorSubmit}
    >
      <div className="form-grid">
        <label className="form-field">
  <span className="field-label">
    Company name <span className="required-mark">*</span>
  </span>
  <input
            value={subcontractorForm.companyName}
            onChange={(event) =>
              setSubcontractorForm({
                ...subcontractorForm,
                companyName: event.target.value,
              })
            }
            placeholder="Enter your company name"
            required
          />
        </label>

        <label className="form-field">
  <span className="field-label">
    Contact name<span className="required-mark">*</span>
  </span>
  <input
            value={subcontractorForm.contactName}
            onChange={(event) =>
              setSubcontractorForm({
                ...subcontractorForm,
                contactName: event.target.value,
              })
            }
            placeholder="Enter the primary contact name"
            required
          />
        </label>

        <label className="form-field">
  <span className="field-label">
    Business email <span className="required-mark">*</span>
  </span>
  <input
            type="email"
            value={subcontractorForm.email}
            onChange={(event) =>
              setSubcontractorForm({
                ...subcontractorForm,
                email: event.target.value,
              })
            }
            placeholder="you@company.com"
            required
          />
        </label>

       <label className="form-field">
  <span className="field-label">
    Phone number <span className="required-mark">*</span>
  </span>
  <input
            type="tel"
            value={subcontractorForm.phone}
            onChange={(event) =>
              setSubcontractorForm({
                ...subcontractorForm,
                phone: event.target.value,
              })
            }
            placeholder="(000) 000-0000"
            required
          />
        </label>

        <label className="form-field form-field-full">
  <span className="field-label">
    Business address <span className="required-mark">*</span>
  </span>
  <textarea
            rows="3"
            value={subcontractorForm.address}
            onChange={(event) =>
              setSubcontractorForm({
                ...subcontractorForm,
                address: event.target.value,
              })
            }
            placeholder="Street address, city, state, ZIP code"
            required
          />
        </label>

        <label className="form-field form-field-full">
          Services offered
          <input
            placeholder="Example: Lawn care, cleaning, inspections, repairs"
            value={subcontractorForm.services}
            onChange={(event) =>
              setSubcontractorForm({
                ...subcontractorForm,
                services: event.target.value,
              })
            }
          />
        </label>
      </div>

      <p className="form-note">
        Fields marked with <span className="required-mark">*</span> are required.
      </p>

      <button
        className="button page-button page-button-primary submit-application-button"
        type="submit"
        disabled={subcontractorLoading}
      >
        {subcontractorLoading ? "Submitting..." : "Submit application"}
      </button>
    </form>

    {subcontractorMessage && (
      <p className="auth-message" role="status">
        {subcontractorMessage}
      </p>
    )}
  </div>
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

        <section id="contact" className="section contact-section p2">
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