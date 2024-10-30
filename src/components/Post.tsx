import React, { useState } from "react";
import { addComment } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
import CommentItem from "./CommentItem"; // Importando o componente CommentItem
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
  comentarios: Comment[];
}

const Post: React.FC<PostProps> = ({
  id,
  title,
  description,
  imageUrl,
  comentarios,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(comentarios);
  const [showSuccess, setShowSuccess] = useState(false);

  const { user } = useAuth();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    if (!user?.id) {
      console.error("Usuário não está logado.");
      return;
    }

    try {
      const commentData = {
        comentario: newComment,
        data: new Date().toISOString(),
        users_permissions_user: user.id,
        post: id,
      };

      const addedComment = await addComment(commentData);

      setComments([
        ...comments,
        { ...addedComment.data, createdAt: new Date().toISOString() },
      ]);
      setNewComment("");
      setShowSuccess(true); //aviso que o comentário foi feito com sucesso
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  return (
    <div className="post-container">
      <div className="post-header" onClick={toggleExpand}>
        <h2>{title}</h2>
        {imageUrl && <img src={imageUrl} alt={title} className="post-image" />}
        <p>{description}</p>

        <p className="comments-count">{comments.length} Comentário(os) </p>
      </div>

      <div className={`post-comments ${isExpanded ? "expanded" : ""}`}>
        <div className="add-comment">
          <input
            type="text"
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={(e) => e.stopPropagation()}
          />
          <button onClick={handleAddComment} disabled={!user}>
            Enviar
          </button>
        </div>
        {showSuccess && <p className="success-message">Comentário enviado!</p>}

        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comentario={comment.comentario}
              createdAt={comment.createdAt}
            />
          ))
        ) : (
          <p>Sem comentários.</p>
        )}
      </div>
    </div>
  );
};

export default Post;
