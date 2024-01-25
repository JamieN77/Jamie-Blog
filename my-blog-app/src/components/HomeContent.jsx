import React from "react";
import HeroBanner from "./homepg-cpnts/HeroBanner";
import SlideBar from "./homepg-cpnts/SlideBar";
import MainContent from "./homepg-cpnts/MainContent";
import "../style/homeContent.css"; // Assuming the CSS file is named test.css and is in the same directory

const HomeContent = () => {
  return (
    <main className="site-main">
      <HeroBanner />
      {/* Blog Slider Start */}
      <SlideBar />
      {/* Blog Slider End */}

      {/* Blog Post Area Start */}
      <MainContent />
      {/* Blog Post Area End */}
    </main>
  );
};

export default HomeContent;
