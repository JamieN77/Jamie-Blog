import React from "react";
import Search from "./Search";
import Categories from "./Categories";
import Tags from "./Tags";
import PopularPosts from "./PopularPosts";
import "../../style/homepg-cpnts-style/aside.css";

const Aside = ({
  activeCategoryIds,
  setActiveCategoryIds,
  activeTagIds,
  setActiveTagIds,
}) => {
  return (
    <aside className="col-lg-4">
      {/* Search */}
      <Search />
      {/* categories */}
      <Categories
        activeCategoryIds={activeCategoryIds}
        setActiveCategoryIds={setActiveCategoryIds}
      />
      {/* tags */}
      <Tags activeTagIds={activeTagIds} setActiveTagIds={setActiveTagIds} />
      {/* latest post */}
      <PopularPosts />
    </aside>
  );
};

export default Aside;
