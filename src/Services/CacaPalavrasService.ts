import api from "./api";

export interface CacaPalavrasItem {
  id: number;
  documentId?: string;
  titulo: string;
  palavras: string[];
  grade: {
    linhas: number;
    colunas: number;
    grade: string[][];
  };
}

interface CacaPalavrasResponse {
  data: CacaPalavrasItem[];
  meta: any;
}

export async function getAllCacaPalavras() {
  try {
    const response = await api.get<CacaPalavrasResponse>("/caca-palavras");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar caça-palavras:", error);
    return { data: [] };
  }
}

export async function createCacaPalavras(titulo: string, palavras: string[]) {
  const response = await api.post("/caca-palavras", {
    data: {
      titulo,
      palavras
    }
  });
  return response.data.data;
}

export async function updateCacaPalavras(id: string | number, titulo: string, palavras: string[]) {
  const response = await api.put(`/caca-palavras/${id}`, {
    data: {
      titulo,
      palavras
    }
  });
  return response.data.data;
}

export async function deleteCacaPalavras(id: string | number) {
  await api.delete(`/caca-palavras/${id}`);
}
