import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/header.css";

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const toggleSearch = () => setShowSearch(!showSearch);

  const handleLogin = () => {
    // Redirect to the backend
    navigate("/login");
  };

  return (
    <header className="navigation">
      <div className="container" id="headercon">
        <nav
          className="navbar navbar-expand-lg navbar-light px-0"
          id="navcontainer"
        >
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
              className="login-btn"
              aria-label="Login"
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              aria-label="navbar toggler"
              className="navbar-toggler border-0"
              type="button"
              data-toggle="collapse"
              data-target="#navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <button
              className="search-icon"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </button>
          </div>

          <div className={`search-dropdown ${showSearch ? "show-search" : ""}`}>
            <div className="search-dropdown-inner">
              <form action="#!" className="search-form">
                <input
                  id="search-query"
                  name="s"
                  type="search"
                  placeholder="Search..."
                  autoComplete="off"
                />
                <button type="submit">Enter</button>
              </form>
            </div>
          </div>
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
    </header>
  );
};

export default Header;
