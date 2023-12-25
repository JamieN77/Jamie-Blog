import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Header";
import MainContent from "./MainContent";
import CreatePost from "./CreatePost";
import EditPost from "./EditPost";
import Article from "./Article";
import Contact from "./Contact";

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <div className="container">
          <div className="row">
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="/edit/:postId" element={<EditPost />} />
              <Route path="/contact" element={<Contact />} />
              {/* Define other routes here */}
            </Routes>
          </div>
        </div>
        {/* Maybe include a Footer component here */}
      </div>
    </Router>
  );
};

export default App;
