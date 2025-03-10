import React, { useEffect, useState } from "react";
import Post from "./Post";
import SkeletonPost from "./SkeletonPost";
import { getAll } from "../Services/postService";
import "./Feed.css";

interface PostData {
  id: number;
  Titulo: string;
  Descricao: string;
  Categoria: string;
  imageUrl: string | null;
  comentarios: {
    id: number;
    comentario: string;
    data: string | null;
    createdAt: string;
  }[];
}

interface FeedProps {
  selectedCategory: string | null;
}

export default function Feed({ selectedCategory }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response: PostData[] = await getAll();
        setTimeout(() => {
          if (response && Array.isArray(response)) {
            setPosts(response);
          }
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.Categoria === selectedCategory)
    : posts;

  return (
    <div className="feed-container">
      {loading ? (
        <div className="feed-posts">
          <>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </>
        </div>
      ) : (
        <div className="feed-posts">
          {/* <img
            src="src/Assets/3e13c1fb-add4-4dcc-ab90-c8a00cbb33de.png"
            className="background-image-feed"
            alt="Arte abstrata"
          /> */}
          {filteredPosts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              title={post.Titulo}
              imageUrl={post.imageUrl}
              description={post.Descricao}
              comentarios={post.comentarios}
            />
          ))}
        </div>
      )}
    </div>
  );
}
