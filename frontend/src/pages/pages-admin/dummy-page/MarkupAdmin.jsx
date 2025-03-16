import React from "react";
import "./markup.css";
import PlaceholderImage from "../../../images/placeholder/dev-placeholder.png";
import LoadingScreen from "../../../components/loading-screen/LoadingScreen";

function MarkupAdmin() {
  return (
    <>
      <LoadingScreen />
      <div className="markup-container">
        <img src={PlaceholderImage} className="img-placeholder"></img>
        <span className="text-holder">
          This feature will be available soon...
        </span>
      </div>
    </>
  );
}

export default MarkupAdmin;
