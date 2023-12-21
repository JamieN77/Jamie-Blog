import React from "react";

const Header = () => {
  return (
    <header className="navigation">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light px-0">
          <a className="navbar-brand order-1 py-0" href="/">
            <img
              loading="preload"
              decoding="async"
              className="img-fluid"
              id="jamielogo"
              src="/images/jamiebloga.png"
              alt="Jamie's Blog Logo"
            />
          </a>
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
                {" "}
                <a className="nav-link" href="about.html">
                  Home
                </a>
              </li>
              <li className="nav-item">
                {" "}
                <a className="nav-link" href="contact.html">
                  Contact
                </a>
              </li>
              <li className="nav-item">
                {" "}
                <a className="nav-link" href="/create">
                  Create Post
                </a>
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
