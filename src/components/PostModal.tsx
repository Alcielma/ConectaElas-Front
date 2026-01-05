import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ReactDOM from "react-dom";
import { IonIcon } from "@ionic/react";
import { arrowBack, bookmark, bookmarkOutline } from "ionicons/icons";
import CommentItem from "./CommentItem";
import { isVideoUrl } from "../Services/FavoritesService";
import { useAuth } from "../Contexts/AuthContext";
import { isPostFavorited, addToFavorites } from "../Services/FavoritesService";
import api from "../Services/api";
import "./PostModal.css";

interface Comment {
    id: number;
    comentario: string;
    data: string | null;
    createdAt: string;
}

interface PostModalProps {
    postId: number;
    title: string;
    imageUrl: string | null;
    description: string;
    comments: Comment[];
    newComment: string;
    setNewComment: (value: string) => void;
    handleAddComment: () => void;
    onClose: () => void;
    onFavoriteChange?: () => void;
}

const PostModal: React.FC<PostModalProps> = ({
  postId,
  title,
  imageUrl,
  description,
  comments,
  newComment,
  setNewComment,
  handleAddComment,
  onClose,
  onFavoriteChange,
}) => {
    const history = useHistory();
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState<number | null>(null);

    useEffect(() => {
        const handler = (ev: any) => {
            ev.detail.register(10, () => {
                onClose();
                history.push("/tabs/tab1");
            });
        };
        document.addEventListener("ionBackButton", handler as any);
        return () => document.removeEventListener("ionBackButton", handler as any);
    }, [onClose, history]);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
          if (user?.id) {
            try {
              const favorite = await isPostFavorited(user.id, postId);
              setIsFavorite(!!favorite);
              setFavoriteId(favorite ? favorite.id : null);
            } catch (error) {}
          }
        };
        checkFavoriteStatus();
    }, [user, postId]);

    const toggleFavorite = async () => {
      if (!user?.id) return;
      try {
        if (isFavorite && favoriteId) {
          const favorite = await isPostFavorited(user.id, postId);
          if (!favorite || !favorite.documentId) {
            throw new Error('Sem documentId do favorito');
          }
          await api.delete(`/favoritos/${favorite.documentId}`);
          setIsFavorite(false);
          setFavoriteId(null);
          if (onFavoriteChange) onFavoriteChange();
        } else {
          const response = await addToFavorites(user.id, postId);
          if (response?.data?.id) {
            setIsFavorite(true);
            setFavoriteId(response.data.id);
            if (onFavoriteChange) onFavoriteChange();
          }
        }
      } catch (error) {}
    };
    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-content" >

                {/* Seta branca para voltar */}
                <div className="modal-header">
                    <IonIcon
                        icon={arrowBack}
                        className="voltar-seta-modal"
                        onClick={onClose}
                    />
                    <div className="modal-title-row">
                      <h2>{title}</h2>
                      <IonIcon
                        icon={isFavorite ? bookmark : bookmarkOutline}
                        className={`favorite-icon ${isFavorite ? "favorited" : ""}`}
                        onClick={toggleFavorite}
                      />
                    </div>
                    {imageUrl && (
                        isVideoUrl(imageUrl) ? (
                            <video 
                                src={imageUrl} 
                                className="modal-image" 
                                controls 
                                preload="metadata"
                            />
                        ) : (
                            <img src={imageUrl} alt={title} className="modal-image" />
                        )
                    )}
                   <p className="modal-description">{description || "Sem descrição disponível."}</p>
                    
                </div>

                <div className="modal-comments">
                    <h4>Comentários</h4>
                    <div className="add-comment">
                        <input
                            type="text"
                            placeholder="Deixe um comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button onClick={handleAddComment}>Enviar</button>
                    </div>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comentario={comment.comentario}
                                createdAt={comment.createdAt}
                            />
                        ))
                    ) : (
                        <p className="sem-comentarios">Sem comentários ainda.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PostModal;
