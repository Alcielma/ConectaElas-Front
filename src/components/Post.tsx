import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { star, starOutline } from "ionicons/icons";
import { addComment } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
import CommentItem from "./CommentItem";
import PostModal from "./PostModal";
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
}

const Post: React.FC<PostProps> = ({
  id,
  title,
  description,
  imageUrl,
  comments: initialComments, // Renamed to avoid conflict with state
}) => {
  console.log("Descrição no Post:", description); // Log para depuração
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

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const key = `favorites_${user.id}`;
      const favorites = JSON.parse(localStorage.getItem(key) || "[]");
      setIsFavorite(favorites.includes(id));
    }
  }, [user, id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no ícone abra o modal
    if (!user?.id) {
      console.error("Usuário não está logado.");
      return;
    }

    const key = `favorites_${user.id}`;
    let favorites = JSON.parse(localStorage.getItem(key) || "[]");

    if (isFavorite) {
      favorites = favorites.filter((f: number) => f !== id);
    } else {
      favorites.push(id);
    }

    localStorage.setItem(key, JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
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

  return (
    <>
      <div className="post-container" onClick={openModal}>
        {imageUrl && <img src={imageUrl} alt={title} className="post-image" />}
        <h2 className="post-title">{title}</h2>
        <IonIcon
          icon={isFavorite ? star : starOutline}
          className={`favorite-icon ${isFavorite ? "favorited" : ""}`}
          onClick={toggleFavorite}
        />
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
    </>
  );
};

export default Post;