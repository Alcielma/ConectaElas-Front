import api from "./api";

export async function addComment(commentData: {
  comentario: string;
  data: string;
  users_permissions_user: number;
  post: number;
}) {
  try {
    const response = await api.post("/comentarios", { data: commentData });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    throw error;
  }
}
