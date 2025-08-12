import React, { useEffect, useState } from "react";
import Post from "./Post";
import SkeletonPost from "./SkeletonPost";
import { getAll } from "../Services/postService";
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
}

export default function Feed({ selectedCategory, horizontalLimit }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response: PostData[] = await getAll();
        console.log("Dados retornados pela API:", response);

        setTimeout(() => {
          let processedPosts: PostData[] = [];
          if (response && Array.isArray(response)) {
            const reversed = [...response].reverse();
            if (selectedCategory === "Favoritos") {
              if (user?.id) {
                const key = `favorites_${user.id}`;
                const favoriteIds = JSON.parse(localStorage.getItem(key) || "[]");
                processedPosts = reversed
                  .filter((p) => favoriteIds.includes(p.id))
                  .slice(0, 5); // Limitar a 5 posts para Favoritos
              } else {
                processedPosts = [];
              }
            } else {
              processedPosts = reversed
                .filter((p) => p.Categoria === selectedCategory)
                .slice(0, 5); // Limitar a 5 posts por categoria
            }
          }
          setPosts(processedPosts);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, user]); // Adicionou 'user' para reagir a mudanças de login

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
            />
          ))}
        </div>
      )}
    </div>
  );
}