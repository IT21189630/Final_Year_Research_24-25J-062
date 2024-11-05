const lessonModel = require("../models/lesson.model");

// get all available lessons
const getLessons = async (req, res) => {
  try {
    const lessons = await lessonModel.find({}).exec();
    if (lessons) {
      return res.status(200).json(lessons);
    } else {
      return res.status(400).json({ error: "Lessons retrieval failed!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// get a lesson by id
const getLessonById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Lesson id not found in the url!" });
  }
  try {
    const lesson = await lessonModel.findById(id).exec();
    if (lesson) {
      return res.status(200).json(lesson);
    } else {
      return res
        .status(400)
        .json({ error: "Lesson details can not be fetched!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// create a new lesson
const createNewLesson = async (req, res) => {
  const { title, level, url, description } = req.body;
  try {
    if (!title || !level || !url || !description) {
      return res.status(400).json({
        error: "lesson should have title, level, url and a description!",
      });
    }
    const createdLesson = await lessonModel.create({
      title,
      level,
      url,
      description,
    });

    if (createdLesson) {
      return res
        .status(201)
        .json({ message: "New lesson created with provided url!" });
    } else {
      return res.status(400).json({ error: "Lesson could not be created!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// update a lesson by id
const updateLessonById = async (req, res) => {
  const { id } = req.params;
  const { title, level, url, description } = req.body;
  try {
    if (!title || !level || !url || !description) {
      return res.status(400).json({
        error: "lesson should have title, level, url and a description!",
      });
    }

    const updatedLesson = await lessonModel.findByIdAndUpdate(
      id,
      { title, level, url, description },
      { new: true }
    );

    if (updatedLesson) {
      return res.status(200).json({
        message: "Lesson updated successfully!",
      });
    } else {
      return res.status(404).json({ error: "Lesson not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// delete a lesson by id
const deleteLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLesson = await lessonModel.findByIdAndDelete(id);

    if (deletedLesson) {
      return res.status(200).json({
        message: "Lesson deleted successfully!",
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
  getLessons,
  getLessonById,
  createNewLesson,
  updateLessonById,
  deleteLessonById,
};
