import api from "./api";

interface CommentData {
  comentario: string;
  data: string;
  id_usuario: { id: number };
  post: { id: number };
}

export const addComment = async (commentData: any) => {
  try {
    const response = await api.post("/comentarios", commentData);
    return response.data;
  } catch (error: any) {
    console.error("Erro ao enviar comentário:", error.response?.data || error);
    throw error;
  }
};

export const getCommentsByPostId = async (postId: number) => {
  try {
    const response = await api.get(
      `/comentarios?filters[post][id][$eq]=${postId}&sort=createdAt:desc`
    );

    const items = Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    return items.map((item: any) => {
      // Suporte a respostas achatadas ou com attributes (defensivo)
      const src = item.attributes ? item.attributes : item;
      return {
        id: item.id,
        comentario: src.comentario,
        data: src.data,
        createdAt: src.createdAt,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar comentários do post:", error);
    return [];
  }
};
