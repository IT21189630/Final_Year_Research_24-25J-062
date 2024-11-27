import React from "react";
import NotFoundPlaceHolder from "../../images/placeholder/page-not-found.png";

function NotFound() {
  return (
    <div className="markup-container">
      <img src={NotFoundPlaceHolder} className="img-placeholder"></img>
      <span className="text-holder">Page Not Available...</span>
    </div>
  );
}

export default NotFound;
