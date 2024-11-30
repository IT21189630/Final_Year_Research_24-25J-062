const recommendationModel = require("../models/recommendation.model");

// get all available recommendedLessons
const getAllRecommendations = async (req, res) => {
  try {
    const recommendedLessons = await recommendationModel.find({}).exec();
    if (recommendedLessons) {
      return res.status(200).json(recommendedLessons);
    } else {
      return res
        .status(400)
        .json({ error: "Recommendation retrieval failed!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// get a recommendation lesson by id
const getRecommendationLessonById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ error: "Recommendation lesson id not found in the url!" });
  }
  try {
    const recommendationLesson = await recommendationModel.findById(id).exec();
    if (recommendationLesson) {
      return res.status(200).json(recommendationLesson);
    } else {
      return res
        .status(400)
        .json({ error: "Recommendation lesson details can not be fetched!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// create a new lesson
const createNewRecommendationLesson = async (req, res) => {
  const { scope, lesson_type, url, description } = req.body;
  try {
    if (!scope || !lesson_type || !url || !description) {
      return res.status(400).json({
        error: "lesson should have scope, lesson_type, url and a description!",
      });
    }
    const createdRecommendation = await recommendationModel.create({
      scope,
      lesson_type,
      url,
      description,
    });

    if (createdRecommendation) {
      return res.status(201).json({
        message: "New recommendation lesson created with provided url!",
      });
    } else {
      return res
        .status(400)
        .json({ error: "Recommendation lesson could not be created!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// update a lesson by id
const updateRecommendationLessonById = async (req, res) => {
  const { id } = req.params;
  const { scope, lesson_type, url, description } = req.body;
  try {
    if (!scope || !lesson_type || !url || !description) {
      return res.status(400).json({
        error:
          "Recommendation lesson should have title, level, url and a description!",
      });
    }

    const updatedLesson = await recommendationModel.findByIdAndUpdate(
      id,
      { scope, lesson_type, url, description },
      { new: true }
    );

    if (updatedLesson) {
      return res.status(200).json({
        message: "Recommendation lesson updated successfully!",
      });
    } else {
      return res
        .status(404)
        .json({ error: "Recommendation lesson not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// delete a recommendation lesson by id
const deleteRecommendationLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLesson = await recommendationModel.findByIdAndDelete(id);

    if (deletedLesson) {
      return res.status(200).json({
        message: "Recommendation lesson deleted successfully!",
      });
    } else {
      return res.status(404).json({ error: "Lesson not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

module.exports = {
  getAllRecommendations,
  getRecommendationLessonById,
  createNewRecommendationLesson,
  updateRecommendationLessonById,
  deleteRecommendationLessonById,
};
