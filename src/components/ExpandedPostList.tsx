import React, { useState, useEffect, useRef } from "react";
import { IonIcon } from "@ionic/react";
import { chatbubble, star, starOutline } from "ionicons/icons";
import CommentItem from "./CommentItem";
import { addComment } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
import { isPostFavorited, addToFavorites, removeFromFavorites, isVideoUrl } from "../Services/FavoritesService";
import api from "../Services/api";
import "./ExpandedPostList.css";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  comments: Comment[];
}

interface ExpandedPostListProps {
  posts: Post[];
  onFavoriteToggle: () => void; 
}

const ExpandedPostList: React.FC<ExpandedPostListProps> = ({ posts, onFavoriteToggle }) => {
  const { user } = useAuth();

  return (
    <div className="expanded-post-list">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} userId={user?.id} onFavoriteToggle={onFavoriteToggle} />
      ))}
    </div>
  );
};

const PostItem: React.FC<{ post: Post; userId: number | undefined; onFavoriteToggle: () => void }> = ({
  post,
  userId,
  onFavoriteToggle,
}) => {
  const [comments, setComments] = useState(
    [...post.comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );
  const [newComment, setNewComment] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [visibleComments, setVisibleComments] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const commentsListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user?.id) {
        try {
          const favorite = await isPostFavorited(user.id, post.id);
          setIsFavorite(!!favorite);
          if (favorite) {
            setFavoriteId(favorite.id);
          } else {
            setFavoriteId(null);
          }
        } catch (error) {
        }
      }
    };
    
    checkFavoriteStatus();
  }, [user, post.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      console.error("Usuário não está logado.");
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        const favorite = await isPostFavorited(user.id, post.id);
        if (!favorite || !favorite.documentId) {
          throw new Error('Não foi possível obter o documentId do favorito');
        }
        await api.delete(`/favoritos/${favorite.documentId}`);
        setIsFavorite(false);
        setFavoriteId(null);
        onFavoriteToggle();
      } else {
        const response = await addToFavorites(user.id, post.id);
        if (response?.data?.id) {
          setIsFavorite(true);
          setFavoriteId(response.data.id);
          onFavoriteToggle();
        }
      }
    } catch (error) {
      console.error(`Erro ao atualizar favoritos para post ${post.id}:`, error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !userId) return;

    const commentData = {
      data: {
        comentario: newComment,
        data: new Date().toISOString(),
        id_usuario: { id: userId },
        post: { id: post.id },
      },
    };

    try {
      const response = await addComment(commentData);
      if (!response?.data?.id) return;

      const added = {
        id: response.data.id,
        comentario: response.data.comentario,
        data: response.data.data,
        createdAt: response.data.createdAt,
      };

      setComments([added, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  return (
    <div className="expanded-post">
      <div className="post-header">
        <h2>{post.title}</h2>
        <IonIcon
          icon={isFavorite ? star : starOutline}
          className={`favorite-icon ${isFavorite ? "favorited" : ""}`}
          onClick={toggleFavorite}
        />
      </div>
      {post.imageUrl && (
        isVideoUrl(post.imageUrl) ? (
          <video 
            src={post.imageUrl} 
            controls 
            preload="metadata"
            style={{ width: '100%', borderRadius: '8px' }}
          />
        ) : (
          <img src={post.imageUrl} alt={post.title} />
        )
      )}
      <p>{post.description || "Descrição não disponível"}</p>

      <div className={`comments-count-box ${expanded ? "active" : ""}`} onClick={() => setExpanded((prev) => !prev)}>
        <IonIcon icon={chatbubble} className="chatbubble-icon" />
        <span className="comments-count">{comments.length}</span>
      </div>

      {expanded && (
        <div className="modal-comments">
          <div className="add-comment">
            <input
              type="text"
              placeholder="Deixe um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Enviar</button>
          </div>

          <div className="comments-container" ref={commentsListRef}>
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
      )}
    </div>
  );
};

export default ExpandedPostList;