import React from "react";
import { Link } from "react-router-dom";
import "../style/contact.css"; // Assuming you will create a Contact.css file for styling

const Contact = () => {
  return (
    <div className="contact-container">
      <aside className="sidebar">
        <div className="search-replacement">
          <img
            src="http://localhost:4000/images/contact-img.png"
            alt="Search Replacement"
          />
        </div>
        <div className="categories">
          <h3>CATEGORIES</h3>
          <ul id="contact-first-ul">
            <li>
              <Link to="/dev">Policies and Guidelines</Link>
            </li>
            <li>
              <Link to="/dev">Frequently Asked Questions</Link>
            </li>
            <li>
              <Link to="/dev">Account Settings</Link>
            </li>
            <li>
              <Link to="/dev">User Consent</Link>
            </li>
            <li>
              <Link to="/dev">Data Regulation</Link>
            </li>
          </ul>
        </div>
      </aside>
      <main className="contact-main">
        <h2>Contact Me</h2>
        <div className="contact-method">
          <h3>Mail</h3>
          <p>123 St</p>
          <p>#999</p>
          <p>Dream city, XY 99999</p>
          <p>Moon</p>
        </div>
        <div className="contact-method">
          <h3>Email</h3>
          <p>support@storysphere.com</p>
        </div>
        <div className="contact-method">
          <h3>Phone</h3>
          <p>+99 123-456-7890</p>
        </div>
        <div className="related-articles">
          <h3>RELATED ARTICLES</h3>
          <ul>
            <li>
              <a
                href="/help/HowDoICreatePost.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                How can I create post?
              </a>
            </li>
            <li>
              <a
                href="/help/HowDoIEditPost.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                How can I edit my post?
              </a>
            </li>
            <li>
              <a
                href="/help/HowDoIDeletePost.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                How can I delete my post?
              </a>
            </li>
            <li>
              <a
                href="/help/HowDoISearchPost.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                How can I search a post?
              </a>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Contact;
