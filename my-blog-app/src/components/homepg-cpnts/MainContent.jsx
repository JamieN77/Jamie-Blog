import React, { useState } from "react";
import PostList from "./PostList";
import Aside from "./Aside";

const MainContent = () => {
  const [activeCategoryIds, setActiveCategoryIds] = useState([]);
  const [activeTagIds, setActiveTagIds] = useState([]);
  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <PostList
            activeCategoryIds={activeCategoryIds}
            activeTagIds={activeTagIds}
          />
          <Aside
            activeCategoryIds={activeCategoryIds}
            setActiveCategoryIds={setActiveCategoryIds}
            activeTagIds={activeTagIds}
            setActiveTagIds={setActiveTagIds}
          />
        </div>
      </div>
    </section>
  );
};

export default MainContent;
