import api from "./api";

interface CommentData {
  comentario: string;
  data: string;
  id_usuario: { id: number };
  post: { id: number };
}

export const addComment = async (commentData: any) => {
  try {
    const response = await api.post("/comentarios", { data: commentData });

    return response.data;
  } catch (error: any) {
    console.error("Erro ao enviar comentário:", error.response?.data || error);
    throw error;
  }
};
