import React, { useState } from "react";
import { addComment } from "../Services/CommentService";
import { deletePost } from "../Services/postService";
import { useAuth } from "../Contexts/AuthContext";
import PostModal from "./PostModal";
import Toast from "./Toast";
import { IonIcon, IonAlert } from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import "./Post.css";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

interface PostProps {
  id: number;
  documentId?: string; // Adiciona documentId
  title: string;
  description: string;
  imageUrl: string | null;
  comments: Comment[];
  onFavoriteChange?: () => void;
  onDelete?: () => void;
}

const Post: React.FC<PostProps> = ({
  id,
  documentId, // Recebe documentId
  title,
  description,
  imageUrl,
  comments: initialComments,
  onFavoriteChange,
  onDelete,
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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const { user, isAssistant } = useAuth();

  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleDeletePost = async () => {
    try {
      await deletePost(id, documentId);
      if (onDelete) {
        onDelete();
      }
      setToast({
        isOpen: true,
        message: "Post apagado com sucesso!",
        type: "success"
      });
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      setToast({
        isOpen: true,
        message: "Erro ao apagar post",
        type: "error"
      });
    }
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
              />
            )
          )}
          <div className="post-text-content">
            <h2 className="post-title">{title}</h2>
          </div>

          {isAssistant && (
            <IonIcon
              icon={trashOutline}
              className="delete-post-icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteAlert(true);
              }}
            />
          )}
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

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Confirmar exclusão"
        message="Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita."
        buttons={[
          { text: "Cancelar", role: "cancel" },
          { 
            text: "Apagar", 
            handler: async () => {
              await handleDeletePost();
            } 
          },
        ]}
      />

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
