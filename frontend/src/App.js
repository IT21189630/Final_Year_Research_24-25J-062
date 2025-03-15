import "./App.css";
import { Routes, Route } from "react-router-dom";

// pages
import Home from "./pages/home/Home";
import SignIn from "./pages/signin/SignIn";
import Signup from "./pages/signup/Signup";
import NotFound from "./pages/not-found/NotFound";
import AdminDashboard from "./pages/dashboard-admin/AdminDashboard";
import AdminProtectedRoute from "./route-guards/AdminProtectedRoute";
import MarkupAdmin from "./pages/pages-admin/dummy-page/MarkupAdmin";
import StudentProtectedRoute from "./route-guards/StudentProtectedRoute";
import StudentDashboard from "./pages/dashboard-student/StudentDashboard";

// m1 page imports
import Lesson1 from "./courses/html/lesson-1/Lesson1";
import Lesson2 from "./courses/html/lesson-2/Lesson2";
import Lesson3 from "./courses/html/lesson-3/Lesson3";
import Lesson4 from "./courses/html/lesson-4/Lesson4";
import Lesson5 from "./courses/html/lesson-5/Lesson5";
import Lesson6 from "./courses/html/lesson-6/Lesson6";
import Lesson7 from "./courses/html/lesson-7/Lesson7";
import Lesson8 from "./courses/html/lesson-8/Lesson8";
import Lesson9 from "./courses/html/lesson-9/Lesson9";
import Lesson10 from "./courses/html/lesson-10/Lesson10";
import HtmlProject from "./courses/html/html_project/HtmlProject";
import Lesson21 from "./courses/css/lesson-21/Lesson21";
import Lesson22 from "./courses/css/lesson-22/Lesson22";
import Lesson23 from "./courses/css/lesson-23/Lesson-23";
import Lesson24 from "./courses/css/lesson-24/Lesson24";
import Lesson25 from "./courses/css/lesson-25/Lesson25";
import Lesson26 from "./courses/css/lesson-26/Lesson26";
import Lesson27 from "./courses/css/lesson-27/Lesson27";

import CourseDisplayer from "./pages/pages-student/available-courses/CourseDisplayer";
import MyEnrollments from "./pages/pages-student/enrolled-courses/MyEnrollments";
import LevelDisplayer from "./pages/pages-student/level-displayer/LevelDisplayer";
import SupportLessonsDisplayer from "./pages/pages-student/support-lessons/SupportLessonsDisplayer";
import MainScreenStudent from "./pages/pages-student/main-screen/MainScreenStudent";
// m2 page imports

// m3 page imports

// m4 page imports

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="*" element={<NotFound />} />

        {/* admin page routes */}
        <Route path="/admin/dashboard" element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard/" element={<AdminDashboard />}>
            <Route path="/admin/dashboard/" element={<MarkupAdmin />} />
          </Route>
        </Route>

        {/* student page routes */}
        <Route path="/student/dashboard" element={<StudentProtectedRoute />}>
          <Route path="/student/dashboard/" element={<StudentDashboard />}>
            <Route path="/student/dashboard/" element={<MainScreenStudent />} />
            <Route
              path="/student/dashboard/courses"
              element={<CourseDisplayer />}
            />
            <Route
              path="/student/dashboard/enrollments"
              element={<MyEnrollments />}
            />
            <Route
              path="/student/dashboard/course/levels/:id"
              element={<LevelDisplayer />}
            />
            <Route
              path="/student/dashboard/course/support_lessons"
              element={<SupportLessonsDisplayer />}
            />
            <Route
              path="/student/dashboard/overview"
              element={<MainScreenStudent />}
            />
          </Route>
        </Route>

        <Route path="/lesson1" element={<Lesson1 />} />
        <Route path="/lesson2" element={<Lesson2 />} />
        <Route path="/lesson3" element={<Lesson3 />} />
        <Route path="/lesson4" element={<Lesson4 />} />
        <Route path="/lesson5" element={<Lesson5 />} />
        <Route path="/lesson6" element={<Lesson6 />} />
        <Route path="/lesson7" element={<Lesson7 />} />
        <Route path="/lesson8" element={<Lesson8 />} />
        <Route path="/lesson9" element={<Lesson9 />} />
        <Route path="/lesson10" element={<Lesson10 />} />
        <Route path="/lesson20" element={<HtmlProject />} />
        <Route path="/lesson21" element={<Lesson21 />} />
        <Route path="/lesson22" element={<Lesson22 />} />
        <Route path="/lesson23" element={<Lesson23 />} />
        <Route path="/lesson24" element={<Lesson24 />} />
        <Route path="/lesson25" element={<Lesson25 />} />
        <Route path="/lesson26" element={<Lesson26 />} />
        <Route path="/lesson27" element={<Lesson27 />} />
      </Routes>
    </div>
  );
}

export default App;
