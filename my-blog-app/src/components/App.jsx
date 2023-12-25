import React from "react";
import Header from "./Header";
import MainContent from "./MainContent";

const App = () => {
  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <MainContent />
        </div>
      </div>
      {/* Maybe include a Footer component here */}
    </div>
  );
};

export default App;
