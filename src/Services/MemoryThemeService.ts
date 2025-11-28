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
  Imagem: { url: string } | null;
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