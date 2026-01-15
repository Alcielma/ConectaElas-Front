import api from "./api";

interface Carta {
  id: number;
  documentId: string;
  Link_imagem: string | null;
  identificacao: string | null;
  Acerto: boolean | null;
  Frase: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  Imagem: { id: number; url: string } | null;
}

interface JogoMemoria {
  id: number;
  documentId: string;
  Titulo: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface TemaMemoria {
  id: number;
  documentId: string;
  Nome_tema: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  cartas: Carta[];
  jogo_memoria: JogoMemoria | null;
  localizations: any[];
}

interface TemaMemoriaResponse {
  data: TemaMemoria[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export async function getAllMemoryThemes() {
  try {
    const response = await api.get<TemaMemoriaResponse>(
      "/tema-jogo-memorias?populate[cartas][populate]=Imagem"
    );
    return response.data;
  } catch (error) {
    return { data: [], meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } } } as TemaMemoriaResponse;
  }
}

export async function getMemoryThemeById(id: number) {
  try {
    const queryResp = await api.get<{ data: TemaMemoria[] }>(
      `/tema-jogo-memorias?filters[id][$eq]=${id}&populate[cartas][populate]=Imagem`
    );
    const arr = queryResp.data?.data ?? [];
    return arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
}

export async function createMemoryTheme(nomeTema: string) {
  const response = await api.post("/tema-jogo-memorias", {
    data: {
      Nome_tema: nomeTema
    }
  });
  return response.data.data;
}

export async function updateMemoryTheme(id: number | string, nomeTema: string) {
  const response = await api.put(`/tema-jogo-memorias/${id}`, {
    data: {
      Nome_tema: nomeTema
    }
  });
  return response.data.data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("files", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data[0]; // Returns the first uploaded file object
}

export async function createCard(themeId: number | string, frase: string, identificacao: string, imageId?: number) {
  const payload: any = {
    Frase: frase,
    identificacao: identificacao,
    Acerto: false,
    tema_jogo_memoria: themeId 
  };

  if (imageId) {
    payload.Imagem = imageId;
  }

  const response = await api.post("/cartas", {
    data: payload
  });
  return response.data.data;
}

export async function deleteMemoryTheme(id: number) {
  // First get the theme to find cards
  const theme = await getMemoryThemeById(id);
  if (theme && theme.cartas) {
    for (const carta of theme.cartas) {
      await deleteCard(carta.documentId || carta.id);
    }
  }
  // Use documentId if available, otherwise id (Strapi v4 vs v5)
  // Strapi v5 often uses documentId for delete/update
  const idToDelete = theme?.documentId || id; 
  // However, api.ts might be configured for v4 which uses ID. 
  // Looking at QuizManagement, it tries to use documentId but falls back to id.
  // And the endpoint is /quizzes/${documentId || id}
  
  await api.delete(`/tema-jogo-memorias/${idToDelete}`);
}

export async function deleteCard(id: number | string) {
  await api.delete(`/cartas/${id}`);
}
