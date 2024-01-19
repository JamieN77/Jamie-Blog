import React from "react";
import { Link } from "react-router-dom";
import "../style/footer.css";

const Footer = () => {
  // Add any methods or state you need here
  const scrollToTop = (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="section-sm pb-0 border-top border-default">
      <div className="container" id="footer-container">
        <div className="row justify-content-between">
          <div className="col-md-3 mb-4" id="firstsec">
            <Link className="mb-1 d-block" id="footer-logo" to="/">
              <img
                className="img-fluid"
                width="150"
                src="http://localhost:4000/images/jamiebloga.png"
                alt="LogBook"
              />
            </Link>
            <p>
              StorySphere is a place where you can easily share your articles
              with our diverse members. Join us for a fun and open community!
            </p>
          </div>

          <div className="col-lg-2 col-md-3 col-6 mb-4 mt-2">
            <h6 className="link-title">Quick Links</h6>
            <ul className="list-unstyled footer-list">
              <li className="list-item">
                <Link to="/about">About</Link>
              </li>
              <li className="list-item">
                <Link to="/contact">Contact</Link>
              </li>
              <li className="list-item">
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li className="list-item">
                <Link to="/terms-conditions">Terms Conditions</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6 mb-4 mt-2">
            <h6 className="link-title">Social Links</h6>
            <ul className="list-unstyled footer-list">
              <li className="list-item">
                <a href="google.com">facebook</a>
              </li>
              <li className="list-item">
                <a href="google.com">twitter</a>
              </li>
              <li className="list-item">
                <a href="google.com">linkedin</a>
              </li>
              <li className="list-item">
                <a href="google.com">github</a>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4 mt-2">
            <h6 className="mb-4">Subscribe Newsletter</h6>
            <form className="subscription" onSubmit={handleSubscribe}>
              <div className="position-relative">
                <i className="ti-email email-icon"></i>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your Email Address"
                  required
                />
              </div>
              <button
                className="btn btn-primary btn-block rounded"
                type="submit"
              >
                Subscribe now
              </button>
            </form>
          </div>
        </div>

        <div className="scroll-top">
          <a href="/" onClick={scrollToTop} id="scrollTop">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              fill="currentColor"
              class="bi bi-arrow-up-circle-fill"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z" />
            </svg>
          </a>
        </div>

        <div className="text-center">
          <p className="content">
            © 2024 - Design & Develop By&nbsp;
            <a href="https://themefisher.com/" className="my-web">
              Jamie Nagy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

const handleSubscribe = (event) => {
  event.preventDefault();
  // Implement your subscription logic here
};

export default Footer;
