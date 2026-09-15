import { useEffect, useState } from "react";
import "./CustomerReviews.css";
function CustomerReviews({ apiBaseUrl }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    rating: 0,
    message: "",
    website: "",
  });

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const loadReviews = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${apiBaseUrl}/api/reviews`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load reviews.");
      }

      setReviews(result.reviews || []);
      setAverageRating(result.averageRating || 0);
      setTotalReviews(result.totalReviews || 0);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Reviews could not be loaded right now. Please refresh the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [apiBaseUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const chooseRating = (rating) => {
    setFormData((currentData) => ({
      ...currentData,
      rating,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.rating < 1 || formData.rating > 5) {
      setStatus({
        type: "error",
        message: "Please select a rating from 1 to 5 stars.",
      });
      return;
    }

    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "We could not publish your review right now."
        );
      }

      setStatus({
        type: "success",
        message: result.message || "Thank you for sharing your experience!",
      });

      setFormData({
        name: "",
        rating: 0,
        message: "",
        website: "",
      });

      await loadReviews();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message ||
          "We could not publish your review right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, className = "") => {
    return (
      <span
        className={`review-stars ${className}`.trim()}
        aria-label={`${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} aria-hidden="true">
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
      </span>
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    return new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section id="reviews" className="section customer-reviews-section">
      <p className="eyebrow">Customer Reviews</p>

      <h2>Share your experience</h2>

      <p className="reviews-intro">
        Your experience helps other customers learn more about our service.
        Reviews are published publicly after submission.
      </p>

      <div className="reviews-summary">
        <div className="reviews-average">
          <strong>{averageRating.toFixed(1)}</strong>
          <span>/ 5</span>
        </div>

        <div>
          {renderStars(Math.round(averageRating), "reviews-summary-stars")}
          <p>
            Based on {totalReviews}{" "}
            {totalReviews === 1 ? "customer review" : "customer reviews"}
          </p>
        </div>
      </div>

      <div className="reviews-layout">
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Write a review</h3>

          <label className="review-field">
            <span>Your name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={80}
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </label>

          <fieldset className="review-rating-field">
            <legend>Your rating</legend>

            <div className="review-rating-buttons">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className={
                    rating <= formData.rating
                      ? "review-star-button is-selected"
                      : "review-star-button"
                  }
                  type="button"
                  onClick={() => chooseRating(rating)}
                  aria-label={`${rating} out of 5 stars`}
                  aria-pressed={rating === formData.rating}
                >
                  ★
                </button>
              ))}
            </div>

            <p className="review-rating-label">
              {formData.rating
                ? `${formData.rating} out of 5 stars selected`
                : "Select a rating"}
            </p>
          </fieldset>

          <label className="review-field">
            <span>Your experience</span>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              minLength={10}
              maxLength={1000}
              rows={6}
              placeholder="Tell others about your experience with us."
              required
            />
          </label>

          <label className="review-honeypot" aria-hidden="true">
            <span>Website</span>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>

          <button
            className="review-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Review"}
          </button>

          {status.message && (
            <p
              className={`review-status review-status-${status.type}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
        </form>

        <div className="reviews-public-list">
          <div className="reviews-public-header">
            <h3>Customer experiences</h3>
            <span>{totalReviews} total</span>
          </div>

          {isLoading && (
            <p className="reviews-loading">Loading customer reviews...</p>
          )}

          {!isLoading && reviews.length === 0 && (
            <div className="reviews-empty-state">
              <p>No reviews yet.</p>
              <span>Be the first customer to share your experience.</span>
            </div>
          )}

          {!isLoading &&
            reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-header">
                  <div>
                    <h4>{review.name}</h4>
                    {renderStars(review.rating)}
                  </div>

                  <time dateTime={review.createdAt}>
                    {formatDate(review.createdAt)}
                  </time>
                </div>

                <p className="review-card-message">{review.message}</p>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}

export default CustomerReviews;