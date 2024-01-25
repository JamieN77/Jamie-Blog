import React, { useState, useEffect, useCallback } from "react";
import Slider from "react-slick";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../style/homepg-cpnts-style/slideBar.css"; // Path to your slider's custom styles

const SlideBar = () => {
  const [slides, setSlides] = useState([]);
  const [sliderReady, setSliderReady] = useState(false);

  // This function updates the classes for the first and last visible slides
  const updateSlideClasses = useCallback(() => {
    // Query for all elements with the classes and remove them
    document.querySelectorAll(".first-visible, .last-visible").forEach((el) => {
      el.classList.remove("first-visible", "last-visible");
    });

    // Get all active slides
    const allActiveSlides = document.querySelectorAll(
      ".slick-slide.slick-active"
    );

    // Add classes to the first and last active slides
    if (allActiveSlides.length > 0) {
      allActiveSlides[0].classList.add("first-visible");
      allActiveSlides[allActiveSlides.length - 1].classList.add("last-visible");
    }
  }, []);

  const fetchRandomPosts = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/posts/random?count=6"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch random posts");
      }
      const data = await response.json();
      setSlides(data);
      setSliderReady(true);
    } catch (error) {
      console.error("Error fetching random posts:", error);
      setSliderReady(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomPosts();
    const interval = setInterval(fetchRandomPosts, 7200000); // Refresh every 2 hours
    return () => clearInterval(interval); // Clear the interval on unmount
  }, [fetchRandomPosts]);

  useEffect(() => {
    if (sliderReady) {
      // Run the class update function after the slider is ready
      updateSlideClasses();
    }
  }, [slides, sliderReady, updateSlideClasses]);

  // Slick Carousel options
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    afterChange: updateSlideClasses,
    responsive: [
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const getRelativeTime = (dateString) => {
    // Parse the date string into a Date object
    const date = new Date(dateString);
    // Return the relative time up to the current moment
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <section>
      <div className="container-relative" id="SlideBar">
        <div className="container" id="secSlidebar">
          <Slider {...settings}>
            {slides.slice(0, 6).map((slide, index) => (
              <div className="item" key={index}>
                <div className="slide-card blog__slide text-center">
                  <div className="blog__slide__img">
                    <img
                      className="card-img rounded-0"
                      src={`http://localhost:4000/${slide.imagepath}`}
                      alt={slide.title}
                    />
                  </div>
                  <div className="blog__slide__content">
                    <Link
                      to={`/article/${slide.id}`}
                      className="blog__slide__label"
                    >
                      {getRelativeTime(slide.date)}
                    </Link>
                    <h3 className="blog__slide__title">
                      <Link to={`/article/${slide.id}`}>{slide.title}</Link>
                    </h3>
                    <p className="blog__slide__real_label">
                      {slide.categories}
                    </p>
                    <div className="blog__slide__popular">
                      {slide.popular_point > 0 ? (
                        <FaHeart className="popular-heart-icon" />
                      ) : (
                        <FaHeartBroken className="unpopular-heart-icon" />
                      )}
                      <span className="popular-point">
                        {slide.popular_point}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default SlideBar;
