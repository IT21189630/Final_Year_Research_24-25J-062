import React, { useState } from "react";
import "./main-screen-student.css";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";
import { IoMdNotifications } from "react-icons/io";
import { FaTrophy } from "react-icons/fa6";
import { TbBadgeFilled } from "react-icons/tb";
import { MdGeneratingTokens } from "react-icons/md";
import { BsCalendarEventFill } from "react-icons/bs";
import { CgEventbrite } from "react-icons/cg";
import { SiConcourse } from "react-icons/si";

function MainScreenStudent() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <LoadingScreen />
      <div className="ms-student-container">
        <div className="filter-container"></div>
        <div className="ms-content-container">
          <span className="page-headline">Overview</span>
          {/* first-row */}
          <div className="ms-cont-row">
            <div className="overview-btn-container">
              <div className="btn-tile notifications">
                <IoMdNotifications className="tile-icon" />
                <span className="tile-name">Notifications</span>
              </div>
              <div className="btn-tile achievements">
                <FaTrophy className="tile-icon" />
                <span className="tile-name">Achievements</span>
              </div>
              <div className="btn-tile badges">
                <TbBadgeFilled className="tile-icon" />
                <span className="tile-name">Badges</span>
              </div>
              <div className="btn-tile tokens">
                <MdGeneratingTokens className="tile-icon" />
                <span className="tile-name">Tokens</span>
              </div>
            </div>
            <div className="daily-challenge-container fr">
              <BsCalendarEventFill className="tile-icon-lg" />
              <span className="tile-name">No daily challenge today!</span>
            </div>
          </div>
          {/* second-row */}
          <div className="ms-cont-row">
            <div className="daily-challenge-container sr">
              <CgEventbrite className="tile-icon-lg" />
              <span className="tile-name">No daily challenge today!</span>
            </div>
            <div className="ov-info-btn-container">
              <SiConcourse className="tile-icon-lg" />
              <span className="tile-name">Community Feed</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainScreenStudent;
