import React, { useEffect, useState } from "react";
import Post from "./Post";
import { getAll } from "../Services/postService.js";
import "./Feed.css";

interface Post {
  id: number;
  Titulo: string;
  Descricao: string;
  imageUrl: string | null;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getAll();
        console.log("Posts formatados:", response);

        if (response && Array.isArray(response)) {
          setPosts(response);
        } else {
          console.error("Formato inesperado da resposta:", response);
        }
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="feed-container">
      <div className="feed-posts">
        {posts?.map((post) => (
          <Post
            key={post.id}
            title={post.Titulo}
            imageUrl={post.imageUrl}
            description={post.Descricao}
          />
        ))}
      </div>
    </div>
  );
}
