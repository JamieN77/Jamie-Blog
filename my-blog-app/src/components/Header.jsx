import React from "react";
import { Link } from "react-router-dom"; // Import the Link component

const Header = () => {
  return (
    <header className="navigation">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light px-0">
          <Link className="navbar-brand order-1 py-0" to="/">
            <img
              loading="preload"
              decoding="async"
              className="img-fluid"
              id="jamielogo"
              src="http://localhost:4000/images/jamiebloga.png"
              alt="Jamie's Blog Logo"
            />
          </Link>
          <div className="navbar-actions order-3 ml-0 ml-md-4">
            <button
              aria-label="navbar toggler"
              className="navbar-toggler border-0"
              type="button"
              data-toggle="collapse"
              data-target="#navigation"
            >
              {" "}
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          <form
            action="#!"
            className="search order-lg-3 order-md-2 order-3 ml-auto"
          >
            <input
              id="search-query"
              name="s"
              type="search"
              placeholder="Search..."
              autoComplete="off"
            />
          </form>
          <div
            className="collapse navbar-collapse text-center order-lg-2 order-4"
            id="navigation"
          >
            <ul className="navbar-nav mx-auto mt-3 mt-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">
                  Contact Me
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/create">
                  Create Post
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <hr />
    </header>
  );
};

export default Header;
