import React from "react";
import PostList from "./PostList";
import Sidebar from "./Sidebar";

const MainContent = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="breadcrumbs mb-5">
              {/* Breadcrumbs go here but I don't have them now*/}
            </div>
            <h1 className="mb-4 border-bottom border-primary d-inline-block mb-5">
              Your blogs
            </h1>
          </div>
          <div className="col-lg-8 mb-5 mb-lg-0">
            <div className="rows">
              <PostList />
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </section>
  );
};

export default MainContent;
