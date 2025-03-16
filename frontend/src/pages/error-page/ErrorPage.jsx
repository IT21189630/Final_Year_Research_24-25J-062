import React from "react";
import "./error-page.styles.css";
import ErrorPlaceHolder from "../../images/placeholder/error.png";

function ErrorPage() {
  return (
    <div className="error-page-container">
      <img src={ErrorPlaceHolder} className="error-img-placeholder"></img>
      <span className="error-text">Error occured while retrieving data!</span>
    </div>
  );
}

export default ErrorPage;
