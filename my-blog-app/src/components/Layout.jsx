// Layout.js
import React from "react";
import { useLocation } from "react-router-dom";

import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  // Define paths where you don't want the header and footer to appear
  const noFooterPaths = ["/login", "/register"];

  // Check if the current path is one of the defined paths
  const showFooter = !noFooterPaths.includes(location.pathname);

  return (
    <>
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

export default Layout;
