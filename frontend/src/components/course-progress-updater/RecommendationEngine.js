import { toast } from "react-hot-toast";
import axiosInstanceRecommendationEngine from "../../axios/axiosInstanceRecommendationEngine";
import axiosInstanceSupportLessonManager from "../../axios/axiosInstanceSupportLessons";

export const recommendationEngine = async (
  performance_score,
  lesson_scope,
  checkpoint,
  user_id
) => {
  try {
    // run recommendation engine
    const response = await axiosInstanceRecommendationEngine.post(
      "/recommendations",
      {
        performance_score,
        lesson_scope,
        checkpoint,
      }
    );
    if (response) {
      // save recommendations
      console.log(response.data.data[0]);
      console.log({
        user_id,
        recommendation_id: response.data.data[0]._id,
      });

      const supportLessonRecord = await axiosInstanceSupportLessonManager.post(
        `/`,
        {
          user_id,
          recommendation_id: response.data.data[0]._id,
        }
      );

      if (supportLessonRecord) {
        toast.success("You have some recommended projects!");
      }
    }
  } catch (error) {
    console.log(error);
    toast.error("Performance record creation failed!");
  }
};
