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
import { getUserFavorites } from "../Services/FavoritesService";
import "./CategoriaPosts.css";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

interface Post {
  id: number;
  documentId?: string; // Adiciona documentId
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
      if (categoria.toLowerCase() === "favoritos") {
        if (user?.id) {
          const favorites = await getUserFavorites(user.id);
          let favoritePosts: Post[] = [];
          
          if (favorites && favorites.length > 0) {
            favorites.forEach((favorite: any) => {
              if (favorite.posts) {
                if (Array.isArray(favorite.posts)) {
                  (favorite.posts as any[]).forEach((post: any) => {
                    if (!favoritePosts.some(p => p.id === post.id)) {
                      favoritePosts.push({
                        id: post.id,
                        documentId: post.documentId,
                        Titulo: post.Title || 'Sem título',
                        Descricao: post.Description || 'Sem descrição',
                        Categoria: post.Categoria || '',
                        imageUrl: post.Link || 
                          (post.Uploadpost && 
                           post.Uploadpost.length > 0 && 
                           post.Uploadpost[0]?.url
                            ? `${import.meta.env.VITE_API_URL}${post.Uploadpost[0].url}`
                            : null),
                        comentarios: []
                      });
                    }
                  });
                } 
                else if (typeof favorite.posts === 'object' && favorite.posts !== null) {
                  const post = favorite.posts as any;
                  if (!favoritePosts.some(p => p.id === post.id)) {
                    favoritePosts.push({
                      id: post.id,
                      documentId: post.documentId,
                      Titulo: post.Title || 'Sem título',
                      Descricao: post.Description || 'Sem descrição',
                      Categoria: post.Categoria || '',
                      imageUrl: post.Link || 
                        (post.Uploadpost && 
                         post.Uploadpost.length > 0 && 
                         post.Uploadpost[0]?.url
                          ? `${import.meta.env.VITE_API_URL}${post.Uploadpost[0].url}`
                          : null),
                      comentarios: []
                    });
                  }
                }
              }
            });
            setPostsFiltrados(favoritePosts);
          } else {
            setPostsFiltrados([]);
          }
        } else {
          setPostsFiltrados([]);
        }
      } else {
        const allPosts: Post[] = await getAll();
        const filtrados = allPosts.filter((p) => p.Categoria === categoria);
        setPostsFiltrados(filtrados);
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  }, [categoria, user]);

  const handleDeletePost = useCallback((postId: number) => {
    setPostsFiltrados(prevPosts => prevPosts.filter(post => post.id !== postId));
    fetchPosts();
  }, [fetchPosts]);

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
              documentId: post.documentId, // Passa documentId
              title: post.Titulo,
              description: post.Descricao,
              imageUrl: post.imageUrl,
              comments: post.comentarios,
            }))
            .reverse()}
          onFavoriteToggle={handleFavoriteToggle}
          onDelete={handleDeletePost}
        />
      </IonContent>
    </IonPage>
  );
};

export default CategoriaPosts;
