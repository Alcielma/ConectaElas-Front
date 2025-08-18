import React, { useEffect, useState, useCallback } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from "@ionic/react";
import { useParams } from "react-router-dom";
import { arrowBack } from "ionicons/icons";
import ExpandedPostList from "../components/ExpandedPostList";
import { getAll } from "../Services/postService";
import { useAuth } from "../Contexts/AuthContext";
import "./CategoriaPosts.css";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

interface Post {
  id: number;
  Titulo: string;
  Descricao: string;
  Categoria: string;
  imageUrl: string | null;
  comentarios: Comment[];
}

const CategoriaPosts: React.FC = () => {
  const { categoria } = useParams<{ categoria: string }>();
  const [postsFiltrados, setPostsFiltrados] = useState<Post[]>([]);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      const allPosts: Post[] = await getAll();
      let filtrados: Post[] = [];
      if (categoria.toLowerCase() === "favoritos") {
        if (user?.id) {
          const key = `favorites_${user.id}`;
          const favoriteIds = JSON.parse(localStorage.getItem(key) || "[]");
          filtrados = allPosts.filter((p) => favoriteIds.includes(p.id));
        }
      } else {
        filtrados = allPosts.filter((p) => p.Categoria === categoria);
      }
      setPostsFiltrados(filtrados);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  }, [categoria, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFavoriteToggle = useCallback(() => {
    if (categoria.toLowerCase() === "favoritos") {
      fetchPosts(); // Re-fetch to update favorites list
    }
  }, [categoria, fetchPosts]);

  const handleGoBack = () => {
    window.history.back(); // Função para voltar para a página anterior
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* Seta de voltar */}
          <IonIcon
            icon={arrowBack}
            className="voltar-seta"
            onClick={handleGoBack}
          />
          <IonTitle>Posts: {categoria}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="custom-background">
        {postsFiltrados.length === 0 && (
          <p className="no-posts">Nenhum post encontrado para {categoria}.</p>
        )}
        <ExpandedPostList
          posts={postsFiltrados
            .map((post) => ({
              id: post.id,
              title: post.Titulo,
              description: post.Descricao,
              imageUrl: post.imageUrl,
              comments: post.comentarios,
            }))
            .reverse()}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </IonContent>
    </IonPage>
  );
};

export default CategoriaPosts;
