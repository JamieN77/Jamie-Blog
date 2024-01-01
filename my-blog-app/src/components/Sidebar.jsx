import React, { useEffect, useRef } from "react";
import "../style/sidebar.css";

const Sidebar = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const updateImageHeight = () => {
      if (imageRef.current) {
        const width = imageRef.current.offsetWidth;
        imageRef.current.style.height = `${width}px`;
      }
    };

    updateImageHeight();
    window.addEventListener("resize", updateImageHeight);

    return () => window.removeEventListener("resize", updateImageHeight);
  }, []);

  return (
    <div className="col-lg-4">
      <div className="widget-blocks">
        <div className="row">
          <div className="col-lg-12">
            <div className="widget mx-5" id="profile">
              <div className="widget-body">
                <img
                  ref={imageRef}
                  loading="lazy"
                  decoding="async"
                  src="http://localhost:4000/images/i2.jpg"
                  alt="About Me"
                  className="author-thumb-sm d-block"
                />
                <h2 className="widget-title title-text my-3">Jamie Nagy</h2>
                <p className="mb-3 pb-2 content-text">
                  This person doesn't have any bio.
                </p>
                <button className="btn btn-sm btn-outline-primary devButton">
                  Profile
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-12 col-md-6">
            <div className="widget">
              <h2 className="section-title mb-3">Explore</h2>
              <div className="widget-body">
                <div className="widget-list">
                  <article className="card mb-4">
                    <div className="card-image">
                      <div className="post-info"></div>
                      <img
                        loading="lazy"
                        decoding="async"
                        src="./images/i2.jpg"
                        alt="Post Thumbnail"
                        className="w-100"
                      />
                    </div>
                    <div className="card-body px-0 pb-1">
                      <h3>
                        Portugal and France Now Allow Unvaccinated Tourists
                      </h3>
                      <p className="card-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor …
                      </p>
                      <div className="fakebtn">
                        <button className="btn btn-sm btn-outline-primary devButton">
                          Read Full Article
                        </button>
                      </div>
                    </div>
                  </article>
                  <article className="card mb-4">
                    <div className="card-image">
                      <div className="post-info"></div>
                      <img
                        loading="lazy"
                        decoding="async"
                        src="./images/i2.jpg"
                        alt="Post Thumbnail"
                        className="w-100"
                      />
                    </div>
                    <div className="card-body px-0 pb-1">
                      <h3>
                        Portugal and France Now Allow Unvaccinated Tourists
                      </h3>
                      <p className="card-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor …
                      </p>
                      <div className="fakebtn">
                        <button className="btn btn-sm btn-outline-primary devButton">
                          Read Full Article
                        </button>
                      </div>
                    </div>
                  </article>
                  <article className="card mb-4">
                    <div className="card-image">
                      <div className="post-info"></div>
                      <img
                        loading="lazy"
                        decoding="async"
                        src="./images/i2.jpg"
                        alt="Post Thumbnail"
                        className="w-100"
                      />
                    </div>
                    <div className="card-body px-0 pb-1">
                      <h3>
                        Portugal and France Now Allow Unvaccinated Tourists
                      </h3>
                      <p className="card-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor …
                      </p>
                      <div className="fakebtn">
                        <button className="btn btn-sm btn-outline-primary devButton">
                          Read Full Article
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
