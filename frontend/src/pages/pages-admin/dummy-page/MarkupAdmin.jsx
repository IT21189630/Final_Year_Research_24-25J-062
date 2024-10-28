import React from "react";
import "./markup.css";
import PlaceholderImage from "../../../images/placeholder/dev-placeholder.png";

function MarkupAdmin() {
  return (
    <div className="markup-container">
      <img src={PlaceholderImage} className="img-placeholder"></img>
      <span className="text-holder">
        This feature will be available soon...
      </span>
    </div>
  );
}

export default MarkupAdmin;
