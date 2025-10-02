import api from "./api";

interface FavoritePost {
  id: number;
  documentId: string;
  Title: string;
  Link: string;
  Description: string;
  Categoria: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

interface FavoriteData {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  posts: FavoritePost[];
  usuario: {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    Tipo: string;
    nome: string | null;
    is_onboarding_viewed: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string | null;
  };
  localizations: any[];
}

interface FavoritesResponse {
  data: FavoriteData[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Buscar todos os favoritos do usuário
export async function getUserFavorites(userId: number) {
  try {
    const response = await api.get<FavoritesResponse>(`/favoritos?populate=posts&filters[usuario][id][$eq]=${userId}`);
    console.log('Resposta da API de favoritos:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    return [];
  }
}

// Adicionar um post aos favoritos
export async function addToFavorites(userId: number, postId: number) {
  try {
    const response = await api.post("/favoritos", {
      data: {
        posts: {
          id: postId
        },
        usuario: {
          id: userId
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar aos favoritos:", error);
    throw error;
  }
}

// Remover um post dos favoritos
export async function removeFromFavorites(favoriteId: number) {
  try {
    const response = await api.delete(`/favoritos/${favoriteId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao remover dos favoritos:", error);
    throw error;
  }
}

// Verificar se um post é favorito de um usuário
export async function isPostFavorited(userId: number, postId: number) {
  try {
    const response = await api.get<FavoritesResponse>(`/favoritos?populate=posts&filters[usuario][id][$eq]=${userId}&filters[posts][id][$eq]=${postId}`);
    const favoriteData = response.data.data.length > 0 ? response.data.data[0] : null;
    
    // Retornando o objeto favorito com o documentId para ser usado na remoção
    return favoriteData;
  } catch (error) {
    console.error(`Erro ao verificar se o post ${postId} é favorito do usuário ${userId}:`, error);
    return null;
  }
}