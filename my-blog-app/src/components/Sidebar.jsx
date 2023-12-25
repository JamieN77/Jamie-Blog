import React from "react";

const Sidebar = () => {
  return (
    <div className="col-lg-4">
      <div className="widget-blocks">
        <div className="row">
          <div className="col-lg-12">
            <div className="widget">
              <div className="widget-body">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/images/i2.jpg"
                  alt="About Me"
                  className="w-100 author-thumb-sm d-block"
                />
                <h2 className="widget-title my-3">Jamie Nagy</h2>
                <p className="mb-3 pb-2">This person doesn't have any bio.</p>
                <button className="btn btn-sm btn-outline-primary devButton">
                  Profile
                </button>
              </div>
            </div>
          </div>
          {/* Additional widgets or content can go here */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
