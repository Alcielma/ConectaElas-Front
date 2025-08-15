import React, { useState, useEffect, useRef } from "react";
import { IonIcon } from "@ionic/react";
import { chatbubble, star, starOutline } from "ionicons/icons";
import CommentItem from "./CommentItem";
import { addComment } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
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
  onFavoriteToggle: () => void; // Added callback prop
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
  const commentsListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const key = `favorites_${user.id}`;
      const favorites = JSON.parse(localStorage.getItem(key) || "[]");
      setIsFavorite(favorites.includes(post.id));
    }
  }, [user, post.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      console.error("Usuário não está logado.");
      return;
    }

    const key = `favorites_${user.id}`;
    let favorites = JSON.parse(localStorage.getItem(key) || "[]");

    if (isFavorite) {
      favorites = favorites.filter((f: number) => f !== post.id);
    } else {
      favorites.push(post.id);
    }

    localStorage.setItem(key, JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
    onFavoriteToggle(); // Notify parent to update posts
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
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} />}
      <p>{post.description || "Descrição não disponível"}</p>

      <div className={`comments-count-box ${expanded ? "active" : ""}`} onClick={() => setExpanded((prev) => !prev)}>
        <IonIcon icon={chatbubble} className="chatbubble-icon" />
        <span className="comments-count">{comments.length}</span>
      </div>

      {expanded && (
        <div className="comments-section">
          <div className="comment-input">
            <input
              type="text"
              placeholder="Deixe um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Enviar</button>
          </div>
          {comments.length > 0 ? (
            <div
              className="comments-list"
              ref={commentsListRef}
              onScroll={(e) => {
                const element = e.currentTarget;
                if (element.scrollTop === 0 && !isLoading && visibleComments < comments.length) {
                  setIsLoading(true);
                  const scrollHeight = element.scrollHeight;
                  setVisibleComments((prev) => Math.min(prev + 3, comments.length));
                  setTimeout(() => {
                    if (commentsListRef.current) {
                      const newScrollHeight = commentsListRef.current.scrollHeight;
                      commentsListRef.current.scrollTop = newScrollHeight - scrollHeight;
                    }
                    setIsLoading(false);
                  }, 100);
                }
              }}
            >
              {comments.slice(0, visibleComments).map((c) => (
                <CommentItem key={c.id} comentario={c.comentario} createdAt={c.createdAt} />
              ))}
              {comments.length > visibleComments && (
                <button
                  className="load-more-comments"
                  onClick={() => setVisibleComments((prev) => prev + 3)}
                >
                  Ver mais comentários
                </button>
              )}
            </div>
          ) : (
            <p className="sem-comentarios">Sem comentários ainda.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandedPostList;