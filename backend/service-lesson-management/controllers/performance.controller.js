const performanceModel = require("../models/performance.model");

// get performance by user
const getPerformanceByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await performanceModel
      .find({ user_id: id })
      .populate("lesson")
      .exec();
    if (results) {
      return res.status(200).json(results);
    } else {
      return res
        .status(400)
        .json({ error: "Performance summary retrieval for the user failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// get performance for specific lesson
const getPerformanceByLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await performanceModel
      .find({ lesson: id })
      .populate("lesson")
      .exec();
    if (results) {
      return res.status(200).json(results);
    } else {
      return res
        .status(400)
        .json({ error: "Performance retrieval for the lesson failed!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

//create course performance record
const createPerformanceRecord = async (req, res) => {
  const { userId, lessonId, performanceScore } = req.body;
  if (!userId || !lessonId || !performanceScore) {
    return res.status(400).json({
      error:
        "user id and course id and performanceScore is required for performance record!",
    });
  }
  try {
    const createdPerformanceRecord = await performanceModel.create({
      user_id: userId,
      lesson: lessonId,
      performance_score: performanceScore,
    });
    if (createdPerformanceRecord) {
      return res
        .status(201)
        .json({ message: "Performance record created for the target lesson" });
    } else {
      return res
        .status(400)
        .json({ error: "Performance record could not be created!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

module.exports = {
  getPerformanceByLesson,
  getPerformanceByUserId,
  createPerformanceRecord,
};
