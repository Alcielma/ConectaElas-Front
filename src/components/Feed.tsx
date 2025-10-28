import React, { useEffect, useState, useCallback } from "react";
import Post from "./Post";
import SkeletonPost from "./SkeletonPost";
import { getAll } from "../Services/postService";
import { getUserFavorites } from "../Services/FavoritesService";
import { getCommentsByPostId } from "../Services/CommentService";
import { useAuth } from "../Contexts/AuthContext";
import "./Feed.css";

interface PostData {
  id: number;
  Titulo: string;
  Descricao: string;
  Categoria: string;
  imageUrl: string | null;
  createdAt: string;
  comentarios: {
    id: number;
    comentario: string;
    data: string | null;
    createdAt: string;
  }[];
}

interface FeedProps {
  selectedCategory: string | null;
  horizontalLimit?: number;
  favoritesVersion?: number;
  onAnyFavoriteChange?: () => void;
  refreshKey?: number; // dispara refetch ao entrar na página
}

export default function Feed({ selectedCategory, horizontalLimit, favoritesVersion, onAnyFavoriteChange, refreshKey }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favoritesUpdated, setFavoritesUpdated] = useState<number>(0);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { user } = useAuth();
  
  // Força atualização dos favoritos
  const updateFavorites = useCallback(() => {
    setFavoritesUpdated(prev => prev + 1);
    if (onAnyFavoriteChange) onAnyFavoriteChange();
  }, [onAnyFavoriteChange]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedCategory === "Favoritos") {
        if (user?.id) {
          const favorites = await getUserFavorites(user.id);
          let favoritePosts: PostData[] = [];
          if (favorites && favorites.length > 0) {
            for (const favorite of favorites) {
              if (favorite.posts) {
                if (Array.isArray(favorite.posts)) {
                  for (const post of favorite.posts as any[]) {
                    if (!favoritePosts.some(p => p.id === post.id)) {
                      const comentarios = await getCommentsByPostId(post.id);
                      favoritePosts.push({
                        id: post.id,
                        Titulo: post.Title || 'Sem título',
                        Descricao: post.Description || 'Sem descrição',
                        Categoria: post.Categoria || '',
                        imageUrl: post.Link || (post.Uploadpost && post.Uploadpost.length > 0 ? `${import.meta.env.VITE_API_URL}${post.Uploadpost[0].url}` : null),
                        createdAt: post.createdAt,
                        comentarios
                      });
                    }
                  }
                } else if (typeof favorite.posts === 'object' && favorite.posts !== null) {
                  const post = favorite.posts as any;
                  if (!favoritePosts.some(p => p.id === post.id)) {
                    const comentarios = await getCommentsByPostId(post.id);
                    favoritePosts.push({
                      id: post.id,
                      Titulo: post.Title || 'Sem título',
                      Descricao: post.Description || 'Sem descrição',
                      Categoria: post.Categoria || '',
                      imageUrl: post.Link || (post.Uploadpost && post.Uploadpost.length > 0 ? `${import.meta.env.VITE_API_URL}${post.Uploadpost[0].url}` : null),
                      createdAt: post.createdAt,
                      comentarios
                    });
                  }
                }
              }
            }
          } else {
            console.log('Nenhum favorito encontrado para o usuário:', user?.id);
          }
          setPosts(favoritePosts.slice(0, horizontalLimit || 5));
        } else {
          setPosts([]);
        }
      } else {
        const response: PostData[] = await getAll();
        if (response && Array.isArray(response)) {
          const processedPosts = response
            .filter((p) => p.Categoria === selectedCategory)
            .slice(0, horizontalLimit || 5);
          setPosts(processedPosts);
        }
      }
      setLastFetch(Date.now());
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, user?.id, horizontalLimit, favoritesUpdated, favoritesVersion]);

  // Carregar inicialmente e quando refreshKey mudar
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  // Recarregar quando a página ganhar foco/visibilidade
  useEffect(() => {
    const handleFocus = () => {
      const timeSinceLast = Date.now() - lastFetch;
      if (timeSinceLast > 5000) {
        fetchPosts();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLast = Date.now() - lastFetch;
        if (timeSinceLast > 5000) {
          fetchPosts();
        }
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPosts, lastFetch]);

  let filteredPosts = posts;
  if (horizontalLimit) {
    filteredPosts = filteredPosts.slice(0, horizontalLimit);
  }

  return (
    <div className={`feed-container ${horizontalLimit ? "horizontal" : ""}`}>
      {loading ? (
        <div className="feed-posts">
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
          <SkeletonPost />
        </div>
      ) : (
        <div className="feed-posts">
          {filteredPosts.length === 0 && selectedCategory === "Favoritos" && (
            <p className="no-posts">Nenhum post favorito encontrado.</p>
          )}
          {filteredPosts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              title={post.Titulo}
              imageUrl={post.imageUrl}
              description={post.Descricao}
              comments={post.comentarios}
              onFavoriteChange={updateFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
}