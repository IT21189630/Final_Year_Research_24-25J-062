import React, { useState } from "react";
import studentLinks from "../../data/student_sidebar_data";
import axiosInstance from "../../axios/axiosInstance";
import { Student } from "../../configurations/userRoles";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/User.slice";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { MdOutlineMenu } from "react-icons/md";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { toast } from "react-hot-toast";
import Logo from "../../images/logo/log-var-6.png";
import LoadingScreen from "../../components/loading-screen/LoadingScreen";

function StudentDashboard() {
  const dispatch = useDispatch();
  const { username, profile_picture, role } = useSelector(
    (state) => state.user
  );
  const navigate = useNavigate();

  const [sidebarVisibility, setSidebarVisibility] = useState(false);

  const sidebarVisibilityAdjuster = () => {
    setSidebarVisibility(!sidebarVisibility);
  };

  const logoutHandler = async () => {
    setSidebarVisibility(false);
    try {
      const response = await axiosInstance.get("/auth/logout", {
        withCredentials: true,
        credentials: "include",
      });
      if (response) {
        dispatch(logout());
        navigate("/sign-in");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* sidebar */}
      <div
        className={`dashboard-sidebar ${
          sidebarVisibility ? "show-bar" : "hide-bar"
        }`}
      >
        <div className="bar-content">
          {/* content of this container will be replaced with the new logo */}
          <div className="platform-logo-placeholder">
            <img src={Logo} alt="sidebar-logo" className="sidebar-logo" />
          </div>
          {studentLinks.map((item, index) => {
            return (
              <Link
                className="sidebar-link"
                to={item.link}
                key={index}
                onClick={() => setSidebarVisibility(false)}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-text fw-medium">{item.text}</span>
              </Link>
            );
          })}

          <div
            className="sidebar-link logout"
            onClick={() => logoutHandler()}
            aria-hidden="true"
          >
            <RiLogoutBoxRLine className="fs-4" />
            <span className="sidebar-link-text fw-medium">Logout</span>
          </div>
        </div>
        <button
          className="bar-activate-btn"
          onClick={() => sidebarVisibilityAdjuster()}
        >
          {sidebarVisibility ? (
            <IoClose className="btn-visibility-icon" />
          ) : (
            <MdOutlineMenu className="btn-visibility-icon" />
          )}
        </button>
      </div>
      {/* admin dashboard-content */}
      <div className="display-container">
        <div className="user-info-ribbon">
          <div className="user-info-section">
            <img src={profile_picture} alt="" className="user-profile-pic" />
            <div className="user-details">
              <span className="user-name">{username}</span>
              <span className="user-role">
                {role === Student ? "Student" : "Administrator"}
              </span>
            </div>
          </div>
        </div>
        <div className="outlet-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
