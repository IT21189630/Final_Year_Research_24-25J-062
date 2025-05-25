import React from "react";
import JsLessonComingSoonPage from "../coming-soon/JsLessonComingSoonPage";
import { jsLessonsConfig } from "../coming-soon/jsLessonsConfig";

function JSLesson3() {
	const lessonData = jsLessonsConfig.lesson3;

	return (
		<JsLessonComingSoonPage
			lessonNumber={lessonData.lessonNumber}
			lessonTitle={lessonData.lessonTitle}
			learningPoints={lessonData.learningPoints}
		/>
	);
}

export default JSLesson3;
