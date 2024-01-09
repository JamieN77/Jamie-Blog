import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";
import MainContent from "./MainContent";
import CreatePost from "./CreatePost";
import EditPost from "./EditPost";
import Article from "./Article";
import Contact from "./Contact";
import Footer from "./Footer";
import HomeContent from "./HomeContent";
import Login from "./Login";
import Register from "./Register";
import "../style/app.css";

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <div className="container-top">
          <div className="row">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<HomeContent />} />
              <Route path="/user" element={<MainContent />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="/edit/:postId" element={<EditPost />} />
              <Route path="/contact" element={<Contact />} />
              {/* Define other routes here */}
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
