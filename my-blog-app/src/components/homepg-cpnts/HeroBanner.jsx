import React, { useState, useEffect } from "react";
import "../../style/homepg-cpnts-style/heroBanner.css"; // make sure to create this CSS file and have it in the correct directory

const HeroBanner = () => {
  const [banner, setBanner] = useState({
    image_path: "hero-01.png",
    topic: "Loading...",
    date: "",
  });

  useEffect(() => {
    const fetchHeroBanner = async () => {
      try {
        const response = await fetch("http://localhost:4000/herobanner/daily", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch hero banner");
        }
        const data = await response.json();
        setBanner(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchHeroBanner();
  }, []);

  return (
    <section className="mb-30px" id="HeroBanner">
      <div className="container" id="hbcontainer">
        <div
          className="hero-banner"
          style={{
            backgroundImage: `url(http://localhost:4000/userimg/hero-banner/${banner.image_path})`,
          }}
        >
          <div className="hero-banner__content">
            <h3>Today's topic</h3>
            <h1>{banner.topic}</h1>
            <h4>{banner.date}</h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
