// import "./App.css";
// import { Routes, Route } from "react-router-dom";

// // pages
// import Home from "./pages/home/Home";
// import SignIn from "./pages/signin/SignIn";
// import Signup from "./pages/signup/Signup";
// import NotFound from "./pages/not-found/NotFound";
// import AdminDashboard from "./pages/dashboard-admin/AdminDashboard";
// import AdminProtectedRoute from "./route-guards/AdminProtectedRoute";
// import MarkupAdmin from "./pages/pages-admin/dummy-page/MarkupAdmin";
// import StudentProtectedRoute from "./route-guards/StudentProtectedRoute";
// import StudentDashboard from "./pages/dashboard-student/StudentDashboard";



// // m1 page imports

// // m2 page imports

// // m3 page imports

// // m4 page imports

// function App() {
//   return (
//     <div className="App">
//       <Routes>
//         <Route path="/" element={<Home/>} />
//         <Route path="/sign-in" element={<SignIn />} />
//         <Route path="/sign-up" element={<Signup />} />
//         <Route path="*" element={<NotFound />} />

//         {/* admin page routes */}
//         <Route path="/admin/dashboard" element={<AdminProtectedRoute />}>
//           <Route path="/admin/dashboard/" element={<AdminDashboard />}>
//             <Route path="/admin/dashboard/" element={<MarkupAdmin />} />
//           </Route>
//         </Route>

//         {/* student page routes */}
//         <Route path="/student/dashboard" element={<StudentProtectedRoute />}>
//           <Route path="/student/dashboard/" element={<StudentDashboard />}>
//             <Route path="/student/dashboard/" element={<MarkupAdmin />} />
//             {/* <Route path="/student/dashboard/challenge" element={<DailyChallenge/>} />
//             <Route path="/student/dashboard/attemptChallenge" element={<HtmlCssChallenge/>} /> */}
//           </Route>
//         </Route>
//       </Routes>
//     </div>
//   );
// }

// export default App;



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

// New pages for daily challenges
import DailyChallengePage from "./pages/daily-challenge/DailyChallengePage";
import AttemptChallengePage from "./pages/daily-challenge/AttemptChallengePage";
import CreateChallengePage from "./pages/pages-admin/create-challenge/CreateChallengePage";

import CreateDailyChallenge from './components/CreateDailyChallenge';
import TodayChallenge from './components/TodayChallenge';
import AttemptChallenge from './components/AttemptChallenge';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
        {/* <Route path="/admin/dashboard/create-challenge" element={<CreateChallengePage />} /> */}
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
            {/* <Route path="/student/dashboard/challenge" element={<DailyChallengePage />} />
            <Route path="/student/dashboard/attempt-challenge/:challengeId" element={<AttemptChallengePage />} /> */}
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;