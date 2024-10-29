import api from "./api";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

export const getCommentsByPostId = async (
  postId: number
): Promise<Comment[]> => {
  try {
    const response = await api.get(`/posts/${postId}?populate=comentarios`);

    return response.data.data.attributes.comentarios.map((comment: any) => ({
      id: comment.id,
      comentario: comment.comentario,
      data: comment.data,
      createdAt: comment.createdAt,
    }));
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return [];
  }
};
