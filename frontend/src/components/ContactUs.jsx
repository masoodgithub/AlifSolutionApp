import { useState } from "react";

function ContactUs({ apiBaseUrl }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send your message.");
      }

      setStatus({
        type: "success",
        message: result.message,
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section contact-section p2">
      <p className="eyebrow">Contact Us</p>

      <h2>Let's discuss your property needs</h2>

      <p className="contact-intro">
        Send us a message and our team will get back to you as soon as possible.
      </p>

      <div className="contact-content">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-row">
            <label className="contact-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength="100"
                autoComplete="name"
                required
              />
            </label>

            <label className="contact-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength="254"
                autoComplete="email"
                required
              />
            </label>
          </div>

          <label className="contact-field">
            <span>Subject</span>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              maxLength="150"
              required
            />
          </label>

          <label className="contact-field">
            <span>Message</span>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              maxLength="5000"
              rows="6"
              required
            />
          </label>

          <label className="contact-honeypot" aria-hidden="true">
            <span>Website</span>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex="-1"
              autoComplete="off"
            />
          </label>

          <button
            className="contact-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {status.message && (
            <p
              className={`contact-status contact-status-${status.type}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
        </form>

        <aside className="contact-details" aria-label="Contact information">
          <article className="contact-card">
            <h3>General & Support</h3>
            <a href="mailto:support@ascsusbd.com">
              support@ascsusbd.com
            </a>
          </article>

          <article className="contact-card">
            <h3>Operations</h3>
            <p>
              Max Davis
              <br />
              <a href="mailto:max.davis@ascsusbd.com">
                max.davis@ascsusbd.com
              </a>
            </p>
            <p>
              Javier Charles
              <br />
              <a href="mailto:javier.charles@ascsusbd.com">
                javier.charles@ascsusbd.com
              </a>
            </p>
          </article>

          <article className="contact-card">
            <h3>Administration</h3>
            <a href="mailto:imtiaj@ascsusbd.com">
              imtiaj@ascsusbd.com
            </a>
          </article>

          <article className="contact-card">
            <h3>Website</h3>
            <a
              href="https://www.ascsusbd.com"
              target="_blank"
              rel="noreferrer"
            >
              Visit www.ascsusbd.com
            </a>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default ContactUs;