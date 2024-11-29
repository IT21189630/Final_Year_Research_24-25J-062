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

import DailyChallenge from "./pages/social-collab-platform/DailyChallenge";
import HtmlCssChallenge from "./pages/submission/HtmlCssChallenge";

// m1 page imports

// m2 page imports

// m3 page imports

// m4 page imports

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<DailyChallenge/>} />
        <Route path="/attemptChallenge" element={<HtmlCssChallenge/>} />
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
      </Routes>
    </div>
  );
}

export default App;
