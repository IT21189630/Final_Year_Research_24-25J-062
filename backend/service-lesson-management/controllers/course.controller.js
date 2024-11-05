const courseModel = require("../models/course.model");

// get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel.find({}).exec();
    if (courses) {
      return res.status(200).json(courses);
    } else {
      return res.status(400).json({ error: "Course retrieval failed!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// get course using course id
const getCourseById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Course id not found in the url!" });
  }
  try {
    const course = await courseModel.findById(id).exec();
    if (course) {
      return res.status(200).json(course);
    } else {
      return res
        .status(400)
        .json({ error: "Course details can not be fetched!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// create new course
const createNewCourse = async (req, res) => {
  const { name, image, price, description, prerequisites, lessons } = req.body;
  try {
    if (
      !name ||
      !image ||
      !price ||
      !description ||
      !prerequisites ||
      !Array.isArray(lessons)
    ) {
      return res.status(400).json({
        error:
          "Necessary properties are missing which required to create a course!",
      });
    }
    const createdCourse = await courseModel.create({
      name,
      image,
      price,
      description,
      prerequisites,
      lessons,
    });

    if (createdCourse) {
      return res.status(201).json({
        message: `New course created with ${lessons.length} lessons!`,
      });
    } else {
      return res.status(400).json({ error: "Course could not be created!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

// update course using course id
const updateCourseById = async (req, res) => {
  const { id } = req.params;
  const { name, image, price, description, prerequisites, lessons } = req.body;
  try {
    if (
      !name ||
      !image ||
      !price ||
      !description ||
      !prerequisites ||
      !Array.isArray(lessons)
    ) {
      return res.status(400).json({
        error:
          "Necessary properties are missing which required to create a course!",
      });
    }

    const updatedCourse = await courseModel.findByIdAndUpdate(
      id,
      { name, image, price, description, prerequisites, lessons },
      { new: true }
    );

    if (updatedCourse) {
      return res.status(200).json({
        message: "Course updated successfully!",
      });
    } else {
      return res.status(404).json({ error: "Course not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// delete course using course id
const deleteCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCourse = await courseModel.findByIdAndDelete(id);

    if (deletedCourse) {
      return res.status(200).json({
        message: "Course deleted successfully!",
      });
    } else {
      return res.status(404).json({ error: "Course not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createNewCourse,
  updateCourseById,
  deleteCourseById,
};
