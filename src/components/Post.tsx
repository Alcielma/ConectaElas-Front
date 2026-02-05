import React, { useState } from "react";
import { addComment } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
import PostModal from "./PostModal";
import Toast from "./Toast";
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
  comments: Comment[];
  onFavoriteChange?: () => void;
}

const Post: React.FC<PostProps> = ({
  id,
  title,
  description,
  imageUrl,
  comments: initialComments, // Renamed to avoid conflict with state
  onFavoriteChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(
    [...initialComments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const { user } = useAuth();

  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

      if (!response?.data?.id) {
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

  // Função para verificar se a URL é de um vídeo
  const isVideoUrl = (url: string) => {
    return url.toLowerCase().endsWith('.mp4') ||
      url.toLowerCase().endsWith('.webm') ||
      url.toLowerCase().endsWith('.ogg') ||
      url.includes('video');
  };

  return (
    <>
      <div className="post-container" onClick={openModal}>
        <div className="post-row">
          {imageUrl && (
            isVideoUrl(imageUrl) ? (
              <video
                src={imageUrl}
                controls
                className="post-thumb"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={imageUrl}
                alt={title}
                className="post-thumb"
                onClick={(e) => e.stopPropagation()}
              />
            )
          )}
          <div className="post-text-content">
            <h2 className="post-title">{title}</h2>
          </div>

          
        </div>

        <p className="post-description">{description}</p>
      </div>

      {isModalOpen && (
        <PostModal
          postId={id}
          title={title}
          imageUrl={imageUrl}
          description={description}
          comments={comments}
          newComment={newComment}
          setNewComment={setNewComment}
          handleAddComment={handleAddComment}
          onClose={closeModal}
          onFavoriteChange={onFavoriteChange}
        />
      )}

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
      />
    </>
  );
};

export default Post;
