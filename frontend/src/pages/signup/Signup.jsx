import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import axiosInstance from "../../axios/axiosInstance";
import Logo from "../../images/logo/log-var-6.png";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import "./signup.styles.css";

function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmpPasswordError, setConfirmPasswordError] = useState(false);

  const validateUsername = () => {
    if (username.toString().length >= 10) {
      return true;
    } else {
      return false;
    }
  };

  const validateEmail = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePassword = () => {
    const passwordPattern = /^[a-zA-Z0-9]{8,}$/;
    return passwordPattern.test(password);
  };

  const validateConfirmPassword = () => {
    if (password === confirmpPassword) {
      return true;
    } else {
      return false;
    }
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      if (validateUsername()) {
        setUsernameError(false);
      } else {
        return setUsernameError(true);
      }

      if (validateEmail()) {
        setEmailError(false);
      } else {
        return setEmailError(true);
      }

      if (validatePassword()) {
        setPasswordError(false);
      } else {
        return setPasswordError(true);
      }

      if (validateConfirmPassword()) {
        setConfirmPasswordError(false);
      } else {
        return setConfirmPasswordError(true);
      }

      const response = await axiosInstance.post("/auth/register/student", {
        username,
        email,
        password,
      });

      if (response.data) {
        resetForm();
        toast.success(`Registration Success! Please Sign in!`);
        navigate("/sign-in");
      }
    } catch (error) {
      toast.error(
        error.response.data
          ? error.response.data.error || error.response.data.message
          : "Account registration failed!"
      );
      console.log(error);
    }
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="signup-page">
      {/* palceholder image container */}
      <div className="signup-placeholder">
        <div className="logo-area-comp">
          <img src={Logo} alt="company-logo" className="logo-comp" />
          <span className="slogan">WebQuest: "Learn, Create, Expolore"</span>
        </div>
        <div className="company-footer">
          <span className="horizontal-divider"></span>
          <div className="com-info">
            Developed & Maintained by Web Quest PVT. Ltd. 2024&#8482;
          </div>
          <div className="social-media-link-cont">
            <FaFacebookSquare className="social-media-icon" />
            <FaSquareXTwitter className="social-media-icon" />
            <FaInstagramSquare className="social-media-icon" />
            <FaLinkedin className="social-media-icon" />
          </div>
        </div>
      </div>

      {/* signin form container */}
      <div className="signup-form-area">
        <form className="signup-form-container" onSubmit={signupHandler}>
          <span className="fs-3 signup-txt">Sign Up</span>
          <p className="form-text signup-para">
            Join the gamifying learning experience and gets hands on experience
            about web development while emjoying the gaming.
          </p>

          <Form.Group controlId="formBasicUsername" className="input-grp">
            <Form.Label className="fw-medium signup-label">Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Form.Text className="text-danger">
              {usernameError ? "At least 10 characters required!" : ""}
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicEmail" className="input-grp">
            <Form.Label className="fw-medium signup-label">
              Email address
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Text className="text-danger">
              {emailError ? "Valid email address is required!" : ""}
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="input-grp">
            <Form.Label className="fw-medium signup-label">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Text className="text-danger">
              {passwordError
                ? "Valid password with 8 characters required!"
                : ""}
            </Form.Text>
          </Form.Group>

          <Form.Group
            controlId="formBasicConfirmPassword"
            className="input-grp"
          >
            <Form.Label className="fw-medium signup-label">
              Confirm Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Re-enter your password"
              value={confirmpPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Form.Text className="text-danger">
              {confirmpPasswordError
                ? "Password mismatch! please check again!"
                : ""}
            </Form.Text>
          </Form.Group>

          <button className="signup-btn" type="submit">
            Signup
          </button>
          <p className="account-link">
            Already have an account?
            <span className="fw-bold">
              <Link to="/sign-in">Sign in</Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
