import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { FaArrowCircleLeft } from "react-icons/fa";
import "../style/register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordLongEnough, setIsPasswordLongEnough] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasDigit, setHasDigit] = useState(false);
  const [hasAllowedSpecialChar, setHasAllowedSpecialChar] = useState(false);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@#$%^&*]{8,}$/;
    return re.test(password);
  };

  const handleGoBack = () => {
    navigate(-2);
  };

  useEffect(() => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute("6LdOtUspAAAAACzbjSPOPVxs41sCaQmr3dX_Ix3s", {
          action: "register",
        })
        .then((token) => {
          // I might want to set the token to state or form depending on how you plan to submit it.
          console.log("reCAPTCHA token:", token);
        });
    });
  }, []);

  const handleDisplayNameChange = (event) => {
    setDisplayName(event.target.value);
  };

  const handleEmailChange = (event) => {
    const emailInput = event.target.value;
    setEmail(emailInput);
    if (!validateEmail(emailInput)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };
  const handlePasswordChange = (event) => {
    const passwordInput = event.target.value;
    setPassword(passwordInput);

    setIsPasswordLongEnough(passwordInput.length >= 8);
    setHasLowercase(/[a-z]/.test(passwordInput));
    setHasUppercase(/[A-Z]/.test(passwordInput));
    setHasDigit(/\d/.test(passwordInput));

    // Check for allowed special characters
    // const specialCharRegex = /[@#$%^&*]/;
    const forbiddenCharRegex = /[^a-zA-Z\d@#$%^&*]/; // checks for any character not allowed
    // const containsAllowedSpecialChar = specialCharRegex.test(passwordInput);
    const containsForbiddenChar = forbiddenCharRegex.test(passwordInput);

    setHasAllowedSpecialChar(!containsForbiddenChar);

    if (!validatePassword(passwordInput)) {
      setPasswordError(
        "Password must be at least 8 characters long and include 1 lowercase letter, 1 uppercase letter and 1 digit."
      );
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return; // Prevent form submission
    }

    if (!validatePassword(password)) {
      setPasswordError("Password does not meet requirements.");
      return; // Prevent form submission
    }

    const token = await recaptchaRef.current.executeAsync();

    if (!token) {
      alert("Please verify you are not a robot.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          recaptchaToken: token,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
      navigate("/login");
    } catch (error) {
      console.error("Registration error", error);
    }
  };

  return (
    <div className="register-container">
      <FaArrowCircleLeft
        className="single-go-back-icon"
        onClick={handleGoBack}
      />
      <form onSubmit={handleSubmit}>
        <div className="form-floating">
          <input
            type="text"
            className="form-control login-email"
            id="floatingDisplayName"
            placeholder="Display Name"
            value={displayName}
            onChange={handleDisplayNameChange}
            maxLength="200"
            required
          />
          <label htmlFor="floatingDisplayName">Display Name</label>
        </div>
        <div className="form-floating">
          <input
            type="email"
            className="form-control login-email"
            id="floatingEmail"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            maxLength="200"
            required
          />
          <label htmlFor="floatingEmail">Email</label>
        </div>

        {emailError && <div className="error-message">{emailError}</div>}
        <div className="form-floating">
          <input
            type="password"
            className="form-control login-password"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            maxLength="200"
            required
          />
          <label htmlFor="floatingPassword">Password</label>
        </div>

        {passwordError && <div className="error-message">{passwordError}</div>}

        <button type="submit" className="login-submit">
          Register
        </button>
        <div className="password-requirements">
          <p>Password requirements:</p>
          <ul>
            <li className={isPasswordLongEnough ? "met" : "not-met"}>
              At least 8 characters
            </li>
            <li className={hasLowercase ? "met" : "not-met"}>
              At least 1 lowercase letter
            </li>
            <li className={hasUppercase ? "met" : "not-met"}>
              At least 1 uppercase letter
            </li>
            <li className={hasDigit ? "met" : "not-met"}>At least 1 digit</li>
            <li className={hasAllowedSpecialChar ? "met" : "not-met"}>
              No special characters other than @ # $ % ^ & *
            </li>
          </ul>
        </div>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
      <ReCAPTCHA
        sitekey="6LdOtUspAAAAACzbjSPOPVxs41sCaQmr3dX_Ix3s"
        ref={recaptchaRef}
        size="invisible"
      />
      <p className="recaptcha-terms">
        This site is protected by reCAPTCHA and the Google&nbsp;
        <a href="https://policies.google.com/privacy">Privacy Policy</a>{" "}
        and&nbsp;
        <a href="https://policies.google.com/terms">Terms of Service</a> apply.
      </p>
    </div>
  );
};

export default Register;
