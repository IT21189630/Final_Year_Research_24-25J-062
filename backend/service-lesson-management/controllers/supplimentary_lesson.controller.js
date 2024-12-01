const supplimentaryLessonModel = require("../models/supplimentary_lessons.model");

// get supplimentary lessons related for a user
const getSupplimentaryLessonByUserId = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User Id id not found in the url!" });
  }
  try {
    const recommendedLessons = await supplimentaryLessonModel
      .find({ user_id: id })
      .populate("recommendation_id")
      .exec();
    if (recommendedLessons) {
      return res.status(200).json(recommendedLessons);
    } else {
      return res
        .status(400)
        .json({ error: "Recommended lesson details can not be fetched!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// create a recommended lesson record
const createNewSupplimentaryLessonRecord = async (req, res) => {
  const { user_id, recommendation_id } = req.body;
  try {
    if (!user_id || !recommendation_id) {
      return res.status(400).json({
        error: "recommended lesson record should have user id and lesson id!",
      });
    }
    const createdRecord = await supplimentaryLessonModel.create({
      user_id,
      recommendation_id,
    });

    if (createdRecord) {
      return res.status(201).json({
        message: "New recommendation lesson record created for the user!",
      });
    } else {
      return res
        .status(400)
        .json({ error: "Recommended lesson record could not be created!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

module.exports = {
  getSupplimentaryLessonByUserId,
  createNewSupplimentaryLessonRecord,
};
