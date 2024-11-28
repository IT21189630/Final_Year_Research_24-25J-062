import { toast } from "react-hot-toast";
import axiosInstance from "../../axios/axiosInstanceLessonMangement";

export const updateCourseProgress = async (
  userId,
  courseId,
  lessonId,
  performanceScore,
  nextLevel
) => {
  try {
    // create a performance record
    const response = await axiosInstance.post("/performance/create", {
      userId,
      lessonId,
      courseId,
      performanceScore,
    });
    if (response) {
      // update user progress
      const updateProgressResponse = await axiosInstance.put(
        `/progress/update/${courseId}`,
        {
          userId,
          currentLevel: nextLevel,
          xpPoints: performanceScore,
        }
      );

      if (updateProgressResponse) {
        return true;
      }
    }
  } catch (error) {
    toast.error("Performance record creation failed!");
  }
};
