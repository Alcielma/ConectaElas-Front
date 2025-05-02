import React, { useState } from "react";
import { addComment } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
import CommentItem from "./CommentItem";
import "./Post.css";
import { IonIcon } from "@ionic/react";
import { chatbubbleSharp } from "ionicons/icons";

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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(
    [...comentarios].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
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
        data: {
          comentario: newComment,
          data: new Date().toISOString(),
          id_usuario: { id: user.id },
          post: { id: id },
        },
      };

      const response = await addComment(commentData);

      if (!response || !response.data || !response.data.id) {
        console.error("Resposta inválida do backend:", response);
        return;
      }

      setComments([
        {
          id: response.data.id,
          comentario: response.data.comentario || "Comentário não disponível",
          data: response.data.data || new Date().toISOString(),
          createdAt: response.data.createdAt || new Date().toISOString(),
        },
        ...comments,
      ]);

      setNewComment("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  return (
    <div className="post-container">
      <div className="post-header" onClick={toggleExpand}>
        <div className="profile-header-post">
          <div className="profile-image">
            <img
              src="/src/Assets/logoPerfil.jpg"
              alt=""
              className="imagem-perfil-post"
            />
          </div>
          <div className="profile-name-post">ConectaElas</div>
        </div>
        <h2 className="post-title">{title}</h2>
        <p
          className={`post-description ${
            isDescriptionExpanded ? "expanded" : ""
          }`}
        >
          {description}
        </p>
        {description.split("\n").length > 3 && (
          <button
            className="ver-mais-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDescriptionExpanded(!isDescriptionExpanded);
            }}
          >
            {isDescriptionExpanded ? "Ver menos" : "Ver mais"}
          </button>
        )}
        {imageUrl && <img src={imageUrl} alt={title} className="post-image" />}

        <div className="comments-count-box">
          <IonIcon icon={chatbubbleSharp} className="chatbubble-icon" />
          <p className="comments-count">{comments.length} Comentário(os) </p>
        </div>
      </div>

      <div className={`post-comments ${isExpanded ? "expanded" : ""}`}>
        <div className="add-comment">
          <input
            type="text"
            placeholder="Deixe aqui sua opinião..."
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
          <p className="sem-comentarios">Sem comentários.</p>
        )}
      </div>
    </div>
  );
};

export default Post;
