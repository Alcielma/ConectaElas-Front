import React from "react";
import "./SkeletonPost.css"; // Importa os estilos do skeleton

const SkeletonPost: React.FC = () => {
  return (
    <div className="skeleton-post">
      <div className="skeleton-image"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text short"></div>
    </div>
  );
};

export default SkeletonPost;
