import api from "./api";

export async function getAll(): Promise<
  { id: number; Titulo: string; Descricao: string; imageUrl: string | null }[]
> {
  try {
    const response = await api.get(
      "/posts?populate[Uploadpost][fields][0]=url"
    );
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
    }));

    console.log("Posts formatados:", formattedPosts);

    return formattedPosts;
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }
}
