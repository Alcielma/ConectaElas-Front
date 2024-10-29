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

export async function getAll(): Promise<PostData[]> {
  try {
    const response = await api.get("/posts?populate=*");
    console.log("Resposta da API:", response.data);

    const formattedPosts = response.data.data.map((post: any) => ({
      id: post.id,
      Titulo: post.Title,
      Descricao: post.Description,
      imageUrl:
        post.Link ||
        (post.Uploadpost &&
        post.Uploadpost.length > 0 &&
        post.Uploadpost[0]?.url
          ? `http://192.168.1.19:1338${post.Uploadpost[0].url}`
          : null),
      comentarios:
        post.comentarios?.map((comment: any) => ({
          id: comment.id,
          comentario: comment.comentario,
          data: comment.data,
          createdAt: comment.createdAt,
        })) || [],
    }));

    console.log("Posts formatados com comentários:", formattedPosts);

    return formattedPosts;
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }
}
