import React, { useState } from "react";
import "./CommentItem.css";

interface CommentProps {
  comentario: string;
  createdAt: string;
}

const Comment: React.FC<CommentProps> = ({ comentario, createdAt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 50;

  const shouldTruncate = comentario.length > MAX_LENGTH;

  return (
    <div className="comment-item">
      <span className="comment-date">
        {new Date(createdAt).toLocaleDateString()}
      </span>
      <p className={`comment-text ${isExpanded ? "expanded" : ""}`}>
        {isExpanded || !shouldTruncate
          ? comentario
          : `${comentario.slice(0, MAX_LENGTH)}...`}
      </p>
      {shouldTruncate && (
        <button
          className="toggle-expand"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  );
};

export default Comment;
