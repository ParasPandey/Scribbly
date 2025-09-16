import { CircularProgress } from "@mui/material";
import React from "react";

const Loader = () => {
  return (
    <div className="custom-loader">
      <CircularProgress
        role="progressbar"
        aria-label="Loading"
        style={{ color: "white" }}
      />
    </div>
  );
};

export default Loader;
