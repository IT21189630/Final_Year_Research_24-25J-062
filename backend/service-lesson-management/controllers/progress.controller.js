const progressModel = require("../models/progress.model");

// get progress of a particular user by user id
const getProgressByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await progressModel
      .find({ user_id: id })
      .populate("course_id")
      .exec();
    if (results) {
      return res.status(200).json(results);
    } else {
      return res
        .status(400)
        .json({ error: "Progress retrieval for the user failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// get progress of a particular user by course id
const getProgressByCourseId = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await progressModel.find({ course_id: id }).exec();
    if (results) {
      return res.status(200).json(results);
    } else {
      return res
        .status(400)
        .json({ error: "Progress retrieval for the course failed!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//create course progress record
const createCourseProgress = async (req, res) => {
  const { userId, courseId } = req.body;
  if (!userId || !courseId) {
    return res.status(400).json({
      error: "user id and course id required for progress record!",
    });
  }
  try {
    const duplicate = await progressModel
      .find({ user_id: userId, course_id: courseId })
      .exec();

    if (duplicate) {
      return res.status(403).json({ message: "You are already enrolled!" });
    }
    const createdProgressRecord = await progressModel.create({
      course_id: courseId,
      user_id: userId,
    });
    if (createdProgressRecord) {
      return res
        .status(201)
        .json({ message: "Progress record created for the target course" });
    } else {
      return res
        .status(400)
        .json({ error: "Progress record could not be created!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// update course progress
const updateCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) {
    return res.status(400).json({
      error: "course id required for update progress!",
    });
  }
  const { userId, currentLevel, xpPoints } = req.body;
  try {
    if (!userId || !currentLevel) {
      return res.status(400).json({
        error: "userId and current level is required!",
      });
    }

    if (!xpPoints) {
      xpPoints = 0;
    }

    const filter = { user_id: userId, course_id: courseId };
    const update = {
      current_level: currentLevel,
      $inc: { current_xp: xpPoints },
    };
    const targetProgressRecord = await progressModel.findOneAndUpdate(
      filter,
      update,
      { new: true }
    );

    if (targetProgressRecord) {
      return res.status(200).json({
        message: "Course progress updated!",
      });
    } else {
      return res
        .status(404)
        .json({ error: "Relevant progress record can not be found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

module.exports = {
  getProgressByCourseId,
  getProgressByUserId,
  createCourseProgress,
  updateCourseProgress,
};
