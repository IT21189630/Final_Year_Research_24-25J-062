import { SiHiveBlockchain } from "react-icons/si";
import { MdPlayLesson } from "react-icons/md";
import { SiCoursera } from "react-icons/si";
import { FaRobot } from "react-icons/fa";
import { GiMechanicalArm } from "react-icons/gi";

const adminSidebarData = [
  {
    text: "Create Lesson",
    icon: <MdPlayLesson />,
    link: "/admin/dashboard/create_lesson",
  },
  {
    text: "Create Course",
    icon: <SiCoursera />,
    link: "/admin/dashboard/create_course",
  },
  {
    text: "Update Course",
    icon: <GiMechanicalArm />,
    link: "/admin/dashboard/update_course",
  },
  {
    text: "Create Recommendation Lesson",
    icon: <FaRobot />,
    link: "/admin/dashboard/create_recommendation",
  },
  {
    text: "Create Daily Challenge",
    icon: <FaRobot />,
    link: "/admin/dashboard/create-challenge",
  },
];

export default adminSidebarData;
