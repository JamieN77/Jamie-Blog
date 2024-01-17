import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/header.css";

const Header = ({ user, refreshUser }) => {
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();

  const truncateDisplayName = (name) => {
    return name.length > 15 ? name.substring(0, 15) + "..." : name;
  };

  const toggleSearch = () => setShowSearch(!showSearch);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/logout", {
        method: "POST",
        credentials: "include", // Needed for cookies to work
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      refreshUser(); // Call to update the App's user state
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    console.log("User in header:", user);
  }, [user]);

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
            {user ? (
              <>
                <span className="header-welcome-message">
                  Welcome, &nbsp;{truncateDisplayName(user.display_name)}
                </span>
                <button
                  className="header-login-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="header-login-logout-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
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
            id={user ? "navigation" : "notUsed"}
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
              {user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/user">
                      My Space
                    </Link>
                  </li>
                  <div className="create-post-center">
                    <Link to="/create" className="create-post-btn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="60%"
                        height="60%"
                        fill="currentColor"
                        class="bi bi-plus-lg"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                        />
                      </svg>
                    </Link>
                  </div>
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
