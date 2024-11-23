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
// m2 page imports

// m3 page imports

// m4 page imports

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
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
            <Route path="/student/dashboard/" element={<MarkupAdmin />} />
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
      </Routes>
    </div>
  );
}

export default App;
