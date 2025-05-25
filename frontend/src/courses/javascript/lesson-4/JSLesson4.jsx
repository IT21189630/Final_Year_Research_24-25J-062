import React from "react";
import JsLessonComingSoonPage from "../coming-soon/JsLessonComingSoonPage";
import { jsLessonsConfig } from "../coming-soon/jsLessonsConfig";

function JSLesson4() {
	const lessonData = jsLessonsConfig.lesson4;

	return (
		<JsLessonComingSoonPage
			lessonNumber={lessonData.lessonNumber}
			lessonTitle={lessonData.lessonTitle}
			learningPoints={lessonData.learningPoints}
		/>
	);
}

export default JSLesson4;
