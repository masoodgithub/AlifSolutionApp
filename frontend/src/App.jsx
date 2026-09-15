import { useEffect, useRef, useState } from "react";
import "./App.css";
import ApplicationDocuments from "./components/ApplicationDocuments";
import ContactUs from "./components/ContactUs";

const API_BASE_URL =
 import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const IDLE_LOGOUT_MS = 15 * 60 * 1000;

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

const emptySubcontractorForm = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  services: "",
};

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

  const [subcontractorForm, setSubcontractorForm] = useState(
    emptySubcontractorForm
  );
  const [subcontractorMessage, setSubcontractorMessage] = useState("");
  const [subcontractorLoading, setSubcontractorLoading] = useState(false);

  const [pendingApplications, setPendingApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [adminApplicationsLoading, setAdminApplicationsLoading] =
    useState(false);
  const [adminApplicationsMessage, setAdminApplicationsMessage] =
    useState("");
  const [adminActionId, setAdminActionId] = useState("");

  const [myApplication, setMyApplication] = useState(null);
  const [myApplicationLoading, setMyApplicationLoading] = useState(false);
  const [myApplicationMessage, setMyApplicationMessage] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNoteDraft, setReviewNoteDraft] = useState("");
  const [reviewNoteSaving, setReviewNoteSaving] = useState(false);

  const idleLogoutTimerRef = useRef(null);

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

    async function loadSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired.");
        }

        setCurrentUser(data.user);
      } catch (error) {
        localStorage.removeItem("alif_token");
        setCurrentUser(null);
      }
    }

    loadSession();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    function clearIdleLogoutTimer() {
      if (idleLogoutTimerRef.current) {
        window.clearTimeout(idleLogoutTimerRef.current);
      }
    }

    function logOutForInactivity() {
      clearIdleLogoutTimer();

      localStorage.removeItem("alif_token");
      localStorage.removeItem("alif_user");

      setCurrentUser(null);
      setSelectedApplication(null);
      setMyApplication(null);
      setAuthMessage("You were signed out after 15 minutes of inactivity.");

      document.getElementById("home")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    function resetIdleLogoutTimer() {
      clearIdleLogoutTimer();

      idleLogoutTimerRef.current = window.setTimeout(
        logOutForInactivity,
        IDLE_LOGOUT_MS
      );
    }

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleLogoutTimer);
    });

    resetIdleLogoutTimer();

    return () => {
      clearIdleLogoutTimer();

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleLogoutTimer);
      });
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadAdminApplications();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role === "admin") {
      setMyApplication(null);
      setMyApplicationMessage("");
      return;
    }

    loadMyApplication();
  }, [currentUser]);

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
        return;
      }

      localStorage.setItem("alif_token", data.token);
      setCurrentUser(data.user);
      setAuthMessage("Login successful.");
      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setAuthMessage(error.message || "Unable to complete request.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("alif_token");
    localStorage.removeItem("alif_user");

    setCurrentUser(null);
    setSelectedApplication(null);
    setMyApplication(null);
    setMyApplicationMessage("");
    setAuthMessage("You have been logged out.");

    document.getElementById("home")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

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
      setSubcontractorForm(emptySubcontractorForm);

      if (currentUser && currentUser.role !== "admin") {
        await loadMyApplication();
      }
    } catch (error) {
      setSubcontractorMessage(
        error.message || "Unable to submit application."
      );
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

      const [
        pendingResponse,
        approvedResponse,
        rejectedResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/admin/subcontractors?status=pending`,
          { headers }
        ),
        fetch(
          `${API_BASE_URL}/api/admin/subcontractors?status=approved`,
          { headers }
        ),
        fetch(
          `${API_BASE_URL}/api/admin/subcontractors?status=rejected`,
          { headers }
        ),
      ]);

      const pendingData = await pendingResponse.json();
      const approvedData = await approvedResponse.json();
      const rejectedData = await rejectedResponse.json();

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

      if (!rejectedResponse.ok) {
        throw new Error(
          rejectedData.message || "Unable to load rejected applications."
        );
      }

      setPendingApplications(pendingData.applications || []);
      setApprovedApplications(approvedData.applications || []);
      setRejectedApplications(rejectedData.applications || []);
    } catch (error) {
      setAdminApplicationsMessage(
        error.message || "Unable to load applications."
      );
    } finally {
      setAdminApplicationsLoading(false);
    }
  }

  async function updateApplicationStatus(
    application,
    status,
    successMessage
  ) {
    const token = localStorage.getItem("alif_token");

    if (!token || currentUser?.role !== "admin") {
      setAdminApplicationsMessage(
        "You must be signed in as an administrator."
      );
      return;
    }

    setAdminActionId(application._id);
    setAdminApplicationsMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/subcontractors/${application._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            reviewNote: application.reviewNote || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to update application (HTTP ${response.status}).`
        );
      }

      setAdminApplicationsMessage(
        successMessage ||
          `${data.application?.companyName || "Application"} updated.`
      );

      if (selectedApplication?._id === application._id) {
        setSelectedApplication(null);
      }

      await loadAdminApplications();
    } catch (error) {
      console.error("Application update failed:", error);
      setAdminApplicationsMessage(
        error.message || "Unable to update application."
      );
    } finally {
      setAdminActionId("");
    }
  }

  async function approveApplication(applicationId) {
    const application = pendingApplications.find(
      (item) => item._id === applicationId
    );

    if (!application) {
      setAdminApplicationsMessage("Application not found.");
      return;
    }

    await updateApplicationStatus(
      application,
      "approved",
      `${application.companyName || "Application"} approved.`
    );
  }

  async function removeApproval(application) {
    const confirmed = window.confirm(
      `Remove approval for ${application.companyName || "this company"}? ` +
        "The application will return to Pending approval."
    );

    if (!confirmed) {
      return;
    }

    await updateApplicationStatus(
      application,
      "pending",
      `Approval removed for ${
        application.companyName || "the application"
      }.`
    );
  }

  async function rejectApplication(application) {
  const companyName = application?.companyName || "this application";

  const confirmed = window.confirm(
    `Reject ${companyName}? The application will move to Rejected applications.`
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("alif_token");

  if (!token || currentUser?.role !== "admin") {
    setAdminApplicationsMessage(
      "You must be signed in as an administrator."
    );
    return;
  }

  setAdminActionId(application._id);
  setAdminApplicationsMessage("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/subcontractors/${application._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "rejected",
          reviewNote: application.reviewNote || "",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Unable to reject application (HTTP ${response.status}).`
      );
    }

    setAdminApplicationsMessage(
      `${data.application?.companyName || companyName} was rejected.`
    );

    if (selectedApplication?._id === application._id) {
      setSelectedApplication(null);
    }

    await loadAdminApplications();
  } catch (error) {
    console.error("Reject application failed:", error);

    setAdminApplicationsMessage(
      error.message || "Unable to reject application."
    );
  } finally {
    setAdminActionId("");
  }
}

  function openApplicationDetails(application) {
    setSelectedApplication(application);
    setReviewNoteDraft(application.reviewNote || "");
  }

  async function saveReviewNote() {
    if (!selectedApplication?._id) {
      return;
    }

    const token = localStorage.getItem("alif_token");

    if (!token || currentUser?.role !== "admin") {
      setAdminApplicationsMessage(
        "You must be signed in as an administrator."
      );
      return;
    }

    setReviewNoteSaving(true);
    setAdminApplicationsMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/subcontractors/${selectedApplication._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: selectedApplication.status,
            reviewNote: reviewNoteDraft.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save review note.");
      }

      const updatedApplication = data.application;

      setSelectedApplication(updatedApplication);
      setReviewNoteDraft(updatedApplication.reviewNote || "");
      setAdminApplicationsMessage("Review note saved.");

      await loadAdminApplications();
    } catch (error) {
      console.error("Save review note failed:", error);
      setAdminApplicationsMessage(
        error.message || "Unable to save review note."
      );
    } finally {
      setReviewNoteSaving(false);
    }
  }

  async function loadMyApplication() {
    const token = localStorage.getItem("alif_token");

    if (!token || !currentUser) {
      setMyApplication(null);
      return;
    }

    setMyApplicationLoading(true);
    setMyApplicationMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/subcontractors/my-application`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setMyApplication(null);
        setMyApplicationMessage("");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your application status."
        );
      }

      setMyApplication(data.application || null);
    } catch (error) {
      console.error("Loading my application failed:", error);
      setMyApplication(null);
      setMyApplicationMessage(
        error.message || "Unable to load your application status."
      );
    } finally {
      setMyApplicationLoading(false);
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

              {currentUser.role === "admin" && (
                <p className="auth-message" role="status">
                  {adminApplicationsLoading
                    ? "Loading admin applications..."
                    : adminApplicationsMessage ||
                      `Admin lists loaded: ${pendingApplications.length} pending, ${approvedApplications.length} approved, ${rejectedApplications.length} rejected.`}
                </p>
              )}

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

              <h2>
                {authMode === "login"
                  ? "Log in to your account"
                  : "Create an account"}
              </h2>

              <p className="account-intro">
                {authMode === "login"
                  ? "Enter your email address and password to continue."
                  : "Complete the form below to register for an ALIF account."}
              </p>

              <form
                className="auth-form styled-form"
                onSubmit={handleAuthSubmit}
              >
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
                  setAuthMode(
                    authMode === "login" ? "register" : "login"
                  );
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
            <p className="eyebrow">
              ALIF Solution & Consulting Service LLC
            </p>

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

          <h2>
            Practical service. Clear communication. Dependable support.
          </h2>

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
              Complete this application form to introduce your company to the
              ALIF team. We will review your submission and contact you about
              next steps.
            </p>

            {currentUser && currentUser.role !== "admin" && (
              <section className="my-application-status">
                <div className="my-application-status-header">
                  <div>
                    <p className="eyebrow">
                      Your subcontractor application
                    </p>

                    <h2>Application status</h2>
                  </div>

                  {myApplication && (
                    <span
                      className={`application-status-badge status-${myApplication.status}`}
                    >
                      {myApplication.status}
                    </span>
                  )}
                </div>

                {myApplicationLoading ? (
                  <p>Loading your application status...</p>
                ) : myApplication ? (
                  <>
                    <p className="my-application-company">
                      {myApplication.companyName || "Your company"}
                    </p>

                    {myApplication.status === "pending" && (
                      <p>
                        Your application is pending review. We will contact
                        you after our team has completed the review.
                      </p>
                    )}

                    {myApplication.status === "approved" && (
                      <p>
                        Your application has been approved. Our team may
                        contact you about available subcontracting
                        opportunities.
                      </p>
                    )}

                    {myApplication.status === "rejected" && (
                      <p>
                        Your application was not approved at this time.
                      </p>
                    )}

                    {myApplication.reviewNote && (
                      <div className="my-application-note">
                        <strong>Review note</strong>
                        <p>{myApplication.reviewNote}</p>
                      </div>
                    )}
                    <ApplicationDocuments />
                  </>
                ) : myApplicationMessage ? (
                  <p className="form-message form-message-error">
                    {myApplicationMessage}
                  </p>
                ) : (
                  <p>
                    You have not submitted a subcontractor application yet.
                  </p>
                )}
              </section>
            )}

            {!currentUser || !myApplication ? (
              <form
                className="subcontractor-form styled-form"
                onSubmit={handleSubcontractorSubmit}
              >
                <div className="form-grid">
                  <label className="form-field">
                    <span className="field-label">
                      Company name{" "}
                      <span className="required-mark">*</span>
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
                      Contact name{" "}
                      <span className="required-mark">*</span>
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
                      Business email{" "}
                      <span className="required-mark">*</span>
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
                      Phone number{" "}
                      <span className="required-mark">*</span>
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
                      Business address{" "}
                      <span className="required-mark">*</span>
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
                  Fields marked with{" "}
                  <span className="required-mark">*</span> are required.
                </p>

                <button
                  className="button page-button page-button-primary submit-application-button"
                  type="submit"
                  disabled={subcontractorLoading}
                >
                  {subcontractorLoading
                    ? "Submitting..."
                    : "Submit application"}
                </button>
              </form>
            ) : currentUser.role !== "admin" ? (
              <p className="subcontractor-form-locked-message">
                You already have a subcontractor application on file. Your
                current status is shown above.
              </p>
            ) : null}

            {subcontractorMessage && (
              <p className="auth-message" role="status">
                {subcontractorMessage}
              </p>
            )}

            {currentUser?.role === "admin" && (
              <section
                className="admin-applications"
                aria-labelledby="admin-applications-title"
              >
                <div className="admin-applications-heading">
                  <div>
                    <p className="eyebrow">Administrator only</p>

                    <h3 id="admin-applications-title">
                      Subcontractor application management
                    </h3>
                  </div>

                  <button
                    className="button page-button page-button-secondary"
                    type="button"
                    onClick={loadAdminApplications}
                    disabled={adminApplicationsLoading}
                  >
                    {adminApplicationsLoading
                      ? "Refreshing..."
                      : "Refresh lists"}
                  </button>
                </div>

                {adminApplicationsMessage && (
                  <p className="auth-message" role="status">
                    {adminApplicationsMessage}
                  </p>
                )}

                <div className="admin-application-grid">
                  <section className="admin-application-list">
                    <div className="admin-list-title">
                      <h4>Pending approval</h4>

                      <span className="application-count">
                        {pendingApplications.length}
                      </span>
                    </div>

                    {adminApplicationsLoading ? (
                      <p className="admin-empty-state">
                        Loading pending applications...
                      </p>
                    ) : pendingApplications.length === 0 ? (
                      <p className="admin-empty-state">
                        No pending applications.
                      </p>
                    ) : (
                      <ul className="company-list">
                        {pendingApplications.map((application) => (
                          <li
                            className="company-list-item"
                            key={application._id}
                          >
                            <strong>
                              {application.companyName || "Unnamed company"}
                            </strong>

                            <span>
                              {application.contactName ||
                                "No contact name"}
                            </span>

                            <span>
                              {application.email || "No email provided"}
                            </span>

                            <button
                              className="text-button company-view-button"
                              type="button"
                              onClick={() =>
                                openApplicationDetails(application)
                              }
                            >
                              View details
                            </button>

                            <button
                              className="button admin-action-button"
                              type="button"
                              onClick={() =>
                                approveApplication(application._id)
                              }
                              disabled={adminActionId === application._id}
                            >
                              {adminActionId === application._id
                                ? "Approving..."
                                : "Approve"}
                            </button>

                            <button
                              className="button admin-action-button admin-reject-button"
                              type="button"
                              onClick={() => rejectApplication(application)}
                              disabled={adminActionId === application._id}
                            >
                              {adminActionId === application._id
                                ? "Rejecting..."
                                : "Reject"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="admin-application-list">
                    <div className="admin-list-title">
                      <h4>Approved companies</h4>

                      <span className="application-count">
                        {approvedApplications.length}
                      </span>
                    </div>

                    {adminApplicationsLoading ? (
                      <p className="admin-empty-state">
                        Loading approved companies...
                      </p>
                    ) : approvedApplications.length === 0 ? (
                      <p className="admin-empty-state">
                        No approved companies.
                      </p>
                    ) : (
                      <ul className="company-list">
                        {approvedApplications.map((application) => (
                          <li
                            className="company-list-item"
                            key={application._id}
                          >
                            <strong>
                              {application.companyName || "Unnamed company"}
                            </strong>

                            <span>
                              {application.contactName ||
                                "No contact name"}
                            </span>

                            <span>
                              {application.email || "No email provided"}
                            </span>

                            <button
                              className="text-button company-view-button"
                              type="button"
                              onClick={() =>
                                openApplicationDetails(application)
                              }
                            >
                              View details
                            </button>

                            <button
                              className="button admin-action-button admin-remove-button"
                              type="button"
                              onClick={() => removeApproval(application)}
                              disabled={adminActionId === application._id}
                            >
                              {adminActionId === application._id
                                ? "Removing..."
                                : "Remove approval"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="admin-application-list">
                    <div className="admin-list-title">
                      <h4>Rejected applications</h4>

                      <span className="application-count">
                        {rejectedApplications.length}
                      </span>
                    </div>

                    {adminApplicationsLoading ? (
                      <p className="admin-empty-state">
                        Loading rejected applications...
                      </p>
                    ) : rejectedApplications.length === 0 ? (
                      <p className="admin-empty-state">
                        No rejected applications.
                      </p>
                    ) : (
                      <ul className="company-list">
                        {rejectedApplications.map((application) => (
                          <li
                            className="company-list-item"
                            key={application._id}
                          >
                            <strong>
                              {application.companyName || "Unnamed company"}
                            </strong>

                            <span>
                              {application.contactName ||
                                "No contact name"}
                            </span>

                            <span>
                              {application.email || "No email provided"}
                            </span>

                            <button
                              className="text-button company-view-button"
                              type="button"
                              onClick={() =>
                                openApplicationDetails(application)
                              }
                            >
                              View details
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </section>
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

        <ContactUs apiBaseUrl={API_BASE_URL} />
      </main>

      <footer className="site-footer">
        <p>© 2026 Alif Solution & Consulting Service LLC</p>
      </footer>

      {selectedApplication && (
        <div
          className="application-modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedApplication(null)}
        >
          <section
            className="application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="application-modal-header">
              <div>
                <p className="eyebrow">Subcontractor application</p>

                <h2 id="application-modal-title">
                  {selectedApplication.companyName || "Company details"}
                </h2>
              </div>

              <button
                className="modal-close-button"
                type="button"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close application details"
              >
                ×
              </button>
            </div>

            <dl className="application-details">
              <div>
                <dt>Contact name</dt>
                <dd>
                  {selectedApplication.contactName || "Not provided"}
                </dd>
              </div>

              <div>
                <dt>Email</dt>
                <dd>{selectedApplication.email || "Not provided"}</dd>
              </div>

              <div>
                <dt>Phone</dt>
                <dd>{selectedApplication.phone || "Not provided"}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{selectedApplication.status || "Not available"}</dd>
              </div>

              <div className="application-detail-full">
                <dt>Business address</dt>
                <dd>{selectedApplication.address || "Not provided"}</dd>
              </div>

              <div className="application-detail-full">
                <dt>Services offered</dt>

                <dd>
                  {Array.isArray(selectedApplication.services)
                    ? selectedApplication.services.join(", ") ||
                      "Not provided"
                    : selectedApplication.services || "Not provided"}
                </dd>
              </div>
            </dl>

            {currentUser?.role === "admin" && (
              <div className="review-note-editor">
                <label htmlFor="review-note">Internal review note</label>

                <textarea
                  id="review-note"
                  value={reviewNoteDraft}
                  onChange={(event) =>
                    setReviewNoteDraft(event.target.value)
                  }
                  placeholder="Add an internal note about this application..."
                  rows="4"
                  maxLength="1000"
                />

                <div className="review-note-editor-footer">
                  <span>{reviewNoteDraft.length}/1000</span>

                  <button
                    className="button admin-action-button"
                    type="button"
                    onClick={saveReviewNote}
                    disabled={reviewNoteSaving}
                  >
                    {reviewNoteSaving ? "Saving..." : "Save note"}
                  </button>
                </div>
              </div>
            )}

            <div className="application-modal-actions">
              <button
                className="button page-button page-button-secondary"
                type="button"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
