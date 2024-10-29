import React, { useState } from "react";
import "./Post.css";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

interface PostProps {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  comentarios: Comment[]; // Adiciona os comentários diretamente como uma propriedade do post
}

const Post: React.FC<PostProps> = ({
  id,
  title,
  description,
  imageUrl,
  comentarios,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="post-container">
      <div className="post-header" onClick={toggleExpand}>
        <h2>{title}</h2>
        <p>{description}</p>
        {imageUrl && <img src={imageUrl} alt={title} className="post-image" />}
        {/* Exibe a quantidade de comentários */}
        <p className="comments-count">{comentarios.length} Comentário(os) </p>
      </div>

      {isExpanded && (
        <div className="post-comments">
          {comentarios.length > 0 ? (
            comentarios.map((comment) => (
              <div key={comment.id} className="comment-item">
                <p>{comment.comentario}</p>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p>Sem comentários.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
