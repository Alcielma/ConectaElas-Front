import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { bookmark, bookmarkOutline } from "ionicons/icons";
import { addComment } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
import CommentItem from "./CommentItem";
import PostModal from "./PostModal";
import Toast from "./Toast";
import { isPostFavorited, addToFavorites, removeFromFavorites } from "../Services/FavoritesService";
import api from "../Services/api";
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
  comments: Comment[]; // Changed to 'comments' to match PostModal prop and resolve type error
  onFavoriteChange?: () => void; // Função para notificar mudanças nos favoritos
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const { user } = useAuth();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user?.id) {
        try {
          const favorite = await isPostFavorited(user.id, id);
          setIsFavorite(!!favorite);
          if (favorite) {
            setFavoriteId(favorite.id);
          } else {
            setFavoriteId(null);
          }
        } catch (error) {
          console.error("Erro ao verificar status de favorito:", error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [user, id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      setToast({
        isOpen: true,
        message: "Você precisa estar logado para favoritar posts.",
        type: "error"
      });
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        const favorite = await isPostFavorited(user.id, id);
        if (!favorite || !favorite.documentId) {
          throw new Error('Não foi possível obter o documentId do favorito');
        }
        await api.delete(`/favoritos/${favorite.documentId}`);
        setIsFavorite(false);
        setFavoriteId(null);
        
        setToast({
          isOpen: true,
          message: "Post removido dos favoritos.",
          type: "info"
        });
        if (onFavoriteChange) {
          onFavoriteChange();
        }
      } else {
        const response = await addToFavorites(user.id, id);
        if (response?.data?.id) {
          setIsFavorite(true);
          setFavoriteId(response.data.id);
          
          setToast({
            isOpen: true,
            message: "Post adicionado aos favoritos!",
            type: "success"
          });
          if (onFavoriteChange) {
            onFavoriteChange();
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao atualizar favoritos para post ${id}:`, error);
      setToast({
        isOpen: true,
        message: "Erro ao atualizar favoritos. Tente novamente.",
        type: "error"
      });
    }
  };

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
      <div className="post-content">
        {imageUrl && (
          isVideoUrl(imageUrl) ? (
            <video 
              src={imageUrl} 
              controls 
              preload="metadata"
              className="post-image"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          ) : (
            <img
              src={imageUrl}
              alt={title}
              className="post-image"
              onClick={(e) => e.stopPropagation()}
            />
          )
        )}
        <IonIcon
          icon={isFavorite ? bookmark : bookmarkOutline}
          className={`favorite-icon ${isFavorite ? "favorited" : ""}`}
          onClick={toggleFavorite}
        />
      </div>
      <h2 className="post-title">{title}</h2>
    </div>

      {isModalOpen && (
        <PostModal
          title={title}
          imageUrl={imageUrl}
          description={description}
          comments={comments}
          newComment={newComment}
          setNewComment={setNewComment}
          handleAddComment={handleAddComment}
          onClose={closeModal}
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