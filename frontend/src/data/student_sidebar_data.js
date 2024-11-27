import { MdDashboard } from "react-icons/md";
import { FaLaptopCode } from "react-icons/fa";
import { AiFillCode } from "react-icons/ai";
import { SiScilab } from "react-icons/si";
import { TbSocial } from "react-icons/tb";
import { FaGraduationCap } from "react-icons/fa6";
import { SiProgress } from "react-icons/si";

const studentSidebarData = [
  {
    text: "My Progress Tracker",
    icon: <MdDashboard />,
    link: "/student/comp",
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
    text: "Practice Lessons",
    icon: <FaGraduationCap />,
    link: "/student/comp",
  },
  {
    text: "Javascript Courses",
    icon: <AiFillCode />,
    link: "/student/comp",
  },

  {
    text: "Code Labratory",
    icon: <SiScilab />,
    link: "/student/comp",
  },
  {
    text: "Dev Collab Platform",
    icon: <TbSocial />,
    link: "/student/comp",
  },
];

export default studentSidebarData;
