import api from "./api";

interface Comment {
  id: number;
  comentario: string;
  data: string | null;
  createdAt: string;
}

interface PostData {
  id: number;
  Titulo: string;
  Descricao: string;
  imageUrl: string | null;
  comentarios: Comment[];
}

export async function getAll() {
  try {
    const response = await api.get("/posts?populate=*");
    const formattedPosts = response.data.data.map((post: any) => ({
      id: post.id,
      Titulo: post.Title,
      Descricao: post.Description,
      Categoria: post.Categoria || "",
      imageUrl:
        post.Link ||
        (post.Uploadpost &&
        post.Uploadpost.length > 0 &&
        post.Uploadpost[0]?.url
          ? `${import.meta.env.VITE_API_URL}${post.Uploadpost[0].url}`
          : null),
      comentarios:
        post.comentarios?.map((comment: any) => ({
          id: comment.id,
          comentario: comment.comentario,
          data: comment.data,
          createdAt: comment.createdAt,
        })) || [],
    }));

    return formattedPosts;
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }
}

export async function getPostById(id: number) {
  try {
    const response = await api.get(`/posts/${id}?populate[comentarios]=*`);
    const post = response.data.data;
    return {
      id: post.id,
      Title: post.Title,
      Description: post.Description,
      Categoria: post.Categoria || "",
      imageUrl:
        post.Link ||
        (post.Uploadpost &&
        post.Uploadpost.length > 0 &&
        post.Uploadpost[0]?.url
          ? `${import.meta.env.VITE_API_URL}${post.Uploadpost[0].url}`
          : null),
      comentarios: post.comentarios.map((comment: any) => ({
        id: comment.id,
        comentario: comment.comentario,
        data: comment.data,
        createdAt: comment.createdAt,
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return null;
  }
}
