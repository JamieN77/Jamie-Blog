import React, { useState, useEffect } from "react";
import Post from "./Post";
import Pagination from "./Pagination.jsx";

const PostList = ({ activeCategoryIds, activeTagIds }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 3;

  useEffect(() => {
    const fetchPostCount = async () => {
      let filterQuery = "";
      if (activeCategoryIds.length > 0) {
        filterQuery += `?categories=${activeCategoryIds.join(",")}`;
      }
      if (activeTagIds.length > 0) {
        filterQuery +=
          (filterQuery.length > 0 ? "&" : "?") +
          `tags=${activeTagIds.join(",")}`;
      }
      try {
        const response = await fetch(
          `http://localhost:4000/posts/count${filterQuery}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch post count");
        }
        const { count } = await response.json();
        setTotalPosts(count);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPostCount();
  }, [activeCategoryIds, activeTagIds]);

  return (
    <div className="col-lg-8  mb-5 mb-lg-0">
      <Post
        currentPage={currentPage}
        postsPerPage={postsPerPage}
        activeCategoryIds={activeCategoryIds}
        activeTagIds={activeTagIds}
      />
      <Pagination
        currentPage={currentPage}
        postsPerPage={postsPerPage}
        totalPosts={totalPosts}
        paginate={setCurrentPage}
      />
    </div>
  );
};

export default PostList;
