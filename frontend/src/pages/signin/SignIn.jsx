import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import axiosInstance from "../../axios/axiosInstance";
import Logo from "../../images/logo/log-var-6.png";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../features/User.slice";
import { toast } from "react-hot-toast";
import { Admin, Student } from "../../configurations/userRoles";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import "./signin.styles.css";

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const loginHandler = async (e) => {
    e.preventDefault();
    console.log(email, password);

    try {
      if (!email || !password) {
        return setError(true);
      }

      setError(false);
      const response = await axiosInstance.post(
        "/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
          credentials: "include",
        }
      );
      resetForm();
      if (response.data) {
        const { username } = response.data;
        toast.success(`Hello! ${username}`);

        dispatch(
          login({
            username: response.data.username,
            user_id: response.data._id,
            profile_picture: response.data.profile_picture,
            role: response.data.user_role,
          })
        );

        console.log(response.data);

        if (response.data.user_role === Admin) {
          return navigate("/admin/dashboard/");
        }
        if (response.data.user_role === Student) {
          return navigate("/student/dashboard/");
        }
      }
    } catch (error) {
      toast.error(
        error.response.data ? error.response.data.error : "login failed!"
      );
      console.log(error);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  return (
    <div className="signin-page">
      {/* palceholder image container */}
      <div className="signin-placeholder">
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
      <div className="signin-form-area">
        <form className="signin-form-container" onSubmit={loginHandler}>
          <span className="fs-3 login-txt">Sign in</span>
          <p className="form-text login-para">
            continue the gamifying learning experience from wherever you left.
            Dive into the magic of learning while entertain your self!
          </p>

          <Form.Group controlId="formBasicEmail" className="input-grp">
            <Form.Label className="fw-medium login-label">
              Email address
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Text className="text-danger">
              {error ? "Please enter your email address!" : ""}
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="input-grp">
            <Form.Label className="fw-medium login-label">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Text className="text-danger">
              {error ? "Please enter your password!" : ""}
            </Form.Text>
          </Form.Group>

          <button className="login-btn" type="submit">
            Login
          </button>
          <p className="account-link">
            Dont have an account yet?
            <span className="fw-bold">
              <Link to="/sign-up">Sign up</Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
