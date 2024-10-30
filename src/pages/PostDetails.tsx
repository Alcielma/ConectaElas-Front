import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../Services/postService"; // Adicione um serviço para buscar o post pelo ID
import "./PostDetails.css";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

interface PostData {
  id: number;
  Title: string;
  Description: string;
  imageUrl: string | null;
  comentarios: Comment[];
}

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostData | null>(null);

  const postId = id ?? "";

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPostById(parseInt(postId));
      setPost(data);
    };

    fetchPost();
  }, [id]);

  if (!post) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="post-details">
      <h1>{post.Title}</h1>
      <p>{post.Description}</p>
      <img
        className="post-image"
        src={post.imageUrl || "https://via.placeholder.com/300"}
        alt={post.Title}
      />

      <h2>Comentários:</h2>
      {post.comentarios.length > 0 ? (
        <ul className="comments-list">
          {post.comentarios.map((comment) => (
            <li key={comment.id}>
              <p>{comment.comentario}</p>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem comentários.</p>
      )}
    </div>
  );
};

export default PostDetails;
