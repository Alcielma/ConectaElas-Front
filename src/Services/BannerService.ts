import api from "./api";

// Interface para o banner
export interface Banner {
  id: number;
  Link: string;
  Titulo: string;
  imageUrl: string;
}

const BannerService = {
  async fetchBanners(): Promise<Banner[]> {
    try {
      const response = await api.get("/banners?populate=*");
      // Verifica se response.data.data é um array
      if (!Array.isArray(response.data.data)) {
        console.error("Dados da API não são um array:", response.data.data);
        return [];
      }

      return response.data.data
        .filter((item: any) => {
          // Verifica se o item tem Link_imagem ou Upload válido
          const hasLinkImagem = item && item.Link_imagem && typeof item.Link_imagem === 'string' && item.Link_imagem.trim() !== '';
          const hasUpload = item && item.Upload && Array.isArray(item.Upload) && item.Upload.length > 0;
          if (!hasLinkImagem && !hasUpload) {
            console.warn(`Item inválido ignorado:`, item);
            return false;
          }
          return true;
        })
        .map((item: any) => {
          return {
            id: item.id || 0,
            Link: item.Link || "#",
            Titulo: item.Titulo || "Título Padrão",
            imageUrl: item.Link_imagem 
              ? item.Link_imagem 
              : `${import.meta.env.VITE_API_URL}${item.Upload?.[0]?.url || "/default-image.jpg"}`,
          };
        });
    } catch (error) {
      console.error("Erro ao buscar banners:", error);
      return [];
    }
  },
  async createBanner(data: { Link: string; Titulo: string; Link_imagem?: string; Upload?: number }) {
    try {
      const payload: any = {
        Link: data.Link,
        Titulo: data.Titulo,
      };
      if (data.Link_imagem) payload.Link_imagem = data.Link_imagem;
      if (data.Upload) payload.Upload = data.Upload;
      const response = await api.post("/banners", { data: payload });
      return response.data?.data;
    } catch (error) {
      console.error("Erro ao criar banner:", error);
      throw error;
    }
  }
};

export default BannerService;
