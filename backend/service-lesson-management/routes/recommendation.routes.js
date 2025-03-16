const express = require("express");
const router = express.Router();
const {
  getAllRecommendations,
  getRecommendationLessonById,
  createNewRecommendationLesson,
  updateRecommendationLessonById,
  deleteRecommendationLessonById,
} = require("../controllers/recommendation.controller");

router.get("/", getAllRecommendations);
router.get("/:id", getRecommendationLessonById);
router.post("/", createNewRecommendationLesson);
router.put("/:id", updateRecommendationLessonById);
router.delete("/:id", deleteRecommendationLessonById);

module.exports = router;
