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


import CreateDailyChallenge from './components/social-collab-platform/CreateDailyChallenge';
import TodayChallenge from './components/social-collab-platform/TodayChallenge';
import AttemptChallenge from './components/social-collab-platform/AttemptChallenge';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
        
        <Route path="/student/dashboard/create-challenge" element={<CreateDailyChallenge />} />
        <Route path="/today-challenge" element={<TodayChallenge />} />
        <Route path="/attempt/:id" element={<AttemptChallenge />} />
        <Route path="/attempt" element={<AttemptChallenge />} />

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