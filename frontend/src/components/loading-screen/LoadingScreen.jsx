import React, { useEffect } from "react";
import Logo from "../../images/logo/log-var-6.png";
import "./loading-screen.css";

function LoadingScreen() {
  useEffect(() => {
    const loader = document.getElementById("loading-screen");
    setTimeout(() => {
      loader.classList.add("slide-up");
    }, 2000);
  }, []);

  return (
    <div className="loading-screen-container" id="loading-screen">
      <img src={Logo} alt="logo" className="logo-container" />
      <span className="slogan">WebQuest: "Learn, Create, Expolore"</span>
    </div>
  );
}

export default LoadingScreen;
