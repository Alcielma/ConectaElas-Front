import React from "react";
import "./SkeletonPost.css";

const SkeletonPost: React.FC = () => {
  return (
    <div className="skeleton-post">
      <div className="skeleton-header-post">
        <div className="skeleton-profile-image"></div>
        <div className="skeleton-profile-name-post"></div>
      </div>
      <div className="skeleton-text-box">
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
      </div>
      <div className="skeleton-image"></div>
    </div>
  );
};

export default SkeletonPost;
