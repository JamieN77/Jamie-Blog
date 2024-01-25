// Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
import "../style/login.css";

const Login = ({ refreshUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (event) => setEmail(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);
  const handleRememerMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError(""); // Reset login error mesasge
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      } else {
        const data = await response.json();
        console.log(data);
        refreshUser();
        navigate("/"); // Redirect to home or dashboard after successful login
      }
    } catch (error) {
      console.error("Login error", error);
      setLoginError(error.message);
      // Handle error (e.g., show error message)
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoogleLogin = () => {
    // Redirect user to Google OAuth route
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="login-container">
      <FaArrowCircleLeft
        className="single-go-back-icon"
        onClick={handleGoBack}
      />
      <form onSubmit={handleSubmit}>
        <div className="form-floating">
          <input
            type="email"
            className="form-control login-mail"
            id="floatingInput"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating">
          <input
            type="password"
            className="form-control login-password"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <div className="form-check text-start">
          <input
            className="form-check-input"
            type="checkbox"
            value="remember-me"
            id="flexCheckDefault"
            checked={rememberMe}
            onChange={handleRememerMeChange}
          />
          <label className="form-check-label" htmlFor="flexCheckDefault">
            Remember me
          </label>
        </div>

        {loginError && <div className="error-message">{loginError}</div>}
        <button type="submit" className="login-submit">
          Login
        </button>
      </form>
      <button onClick={handleGoogleLogin} className="google-login">
        <img src="http://localhost:4000/images/google-logo.png" alt="Google" />
        Login with Google
      </button>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
