import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Header from "./Header";
import MainContent from "./MainContent";
import CreatePost from "./CreatePost";
import EditPost from "./EditPost";
import Article from "./Article";
import Contact from "./Contact";
import HomeContent from "./HomeContent";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import "../style/app.css";

const App = () => {
  const [user, setUser] = useState(null);

  // This function can be called to refresh the user state
  const refreshUser = () => {
    fetch("http://localhost:4000/check-auth", {
      credentials: "include", // Needed for cookies to work
    })
      .then((response) => {
        if (!response.ok) throw new Error("Not logged in");
        return response.json();
      })
      .then((data) => {
        console.log("User data:", data);
        setUser(data); // Set the user data
      })
      .catch(() => {
        console.error("User is not authenticated");
        setUser(null);
      });
  };

  // Call refreshUser on component mount
  useEffect(() => {
    refreshUser();
  }, []);
  return (
    <Router>
      <div>
        <Header user={user} refreshUser={refreshUser} />
        <div className="container-top">
          <div className="row">
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <HomeContent />
                  </Layout>
                }
              />
              <Route
                path="/user"
                element={
                  <Layout>
                    <MainContent />
                  </Layout>
                }
              />

              <Route
                path="/article/:id"
                element={
                  <Layout>
                    <Article />
                  </Layout>
                }
              />

              <Route
                path="/contact"
                element={
                  <Layout>
                    <Contact />
                  </Layout>
                }
              />
              {/* No Footer for login and register */}
              <Route
                path="/login"
                element={<Login refreshUser={refreshUser} />}
              />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/edit/:postId" element={<EditPost />} />
              <Route path="/register" element={<Register />} />
              <Route path="/user/profile" element={<Profile />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
