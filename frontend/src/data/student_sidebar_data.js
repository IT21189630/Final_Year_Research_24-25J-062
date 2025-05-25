import { MdDashboard } from "react-icons/md";
import { FaLaptopCode } from "react-icons/fa";
import { AiFillCode } from "react-icons/ai";
import { SiScilab } from "react-icons/si";
import { TbSocial } from "react-icons/tb";
import { FaGraduationCap } from "react-icons/fa6";
import { SiProgress } from "react-icons/si";
import { FaTrophy } from "react-icons/fa";

const studentSidebarData = [
	{
		text: "My Progress Tracker",
		icon: <MdDashboard />,
		link: "/student/dashboard/overview",
	},
	{
		text: "HTML/CSS Courses",
		icon: <FaLaptopCode />,
		link: "/student/dashboard/courses",
	},
	{
		text: "My Enrollments",
		icon: <SiProgress />,
		link: "/student/dashboard/enrollments",
	},
	{
		text: "Leaderboard",
		icon: <FaTrophy />,
		link: "/student/dashboard/leaderboard",
	},
	{
		text: "Practice Lessons",
		icon: <FaGraduationCap />,
		link: "/student/dashboard/course/support_lessons",
	},
	{
		text: "Javascript Courses",
		icon: <AiFillCode />,
		link: "/student/dashboard/js-courses",
	},
	{
		text: "Code Labratory",
		icon: <SiScilab />,
		link: "/student/dashboard/virtuallab",
	},
		{
		text: "Daily Challenge",
		icon: <SiScilab />,
		link: "/student/dashboard/today-challenge",
	},
];

export default studentSidebarData;
