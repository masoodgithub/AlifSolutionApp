const express = require("express");
const { getReviewCollection } = require("../models/reviewModel");

const router = express.Router();

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatPublicReview(review) {
  return {
    id: review._id.toString(),
    name: review.name,
    rating: review.rating,
    message: review.message,
    createdAt: review.createdAt,
  };
}

/*
  GET /api/reviews

  Returns public reviews plus the average rating summary.
*/
router.get("/", async (req, res) => {
  try {
    const reviews = getReviewCollection();

    const reviewList = await reviews
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const totalReviews = reviewList.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : Number(
            (
              reviewList.reduce((total, review) => total + review.rating, 0) /
              totalReviews
            ).toFixed(1)
          );

    return res.json({
      success: true,
      averageRating,
      totalReviews,
      reviews: reviewList.map(formatPublicReview),
    });
  } catch (error) {
    console.error("Get reviews error:", error.message);

    return res.status(500).json({
      success: false,
      message: "We could not load reviews right now. Please try again later.",
    });
  }
});

/*
  POST /api/reviews

  Public submissions publish immediately.
*/
router.post("/", async (req, res) => {
  try {
    const name = cleanText(req.body?.name);
    const message = cleanText(req.body?.message);
    const rating = Number(req.body?.rating);
    const website = cleanText(req.body?.website);

    // Hidden honeypot: bots often fill this field.
    if (website) {
      return res.status(200).json({
        success: true,
        message: "Thank you for sharing your experience.",
      });
    }

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name using 2 to 80 characters.",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please select a rating from 1 to 5 stars.",
      });
    }

    if (message.length < 10 || message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Your review must be between 10 and 1,000 characters.",
      });
    }

    const reviews = getReviewCollection();

    const newReview = {
      name,
      rating,
      message,
      status: "published",
      createdAt: new Date(),
    };

    const result = await reviews.insertOne(newReview);

    return res.status(201).json({
      success: true,
      message: "Thank you for sharing your experience!",
      review: {
        id: result.insertedId.toString(),
        name: newReview.name,
        rating: newReview.rating,
        message: newReview.message,
        createdAt: newReview.createdAt,
      },
    });
  } catch (error) {
    console.error("Create review error:", error.message);

    return res.status(500).json({
      success: false,
      message: "We could not publish your review right now. Please try again later.",
    });
  }
});

module.exports = router;