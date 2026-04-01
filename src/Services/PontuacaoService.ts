import api from "./api";

// Tipos de jogos suportados - DEVE coincidir com o backend!
export type TipoJogo = "quiz" | "memoria" | "cacapalavras" | "palavracruzada";

// Interface para criação/atualização de pontuação
export interface CriarPontuacaoDTO {
  jogo: TipoJogo;
  acertos: number;
  totalPerguntas: number;
  users_permissions_user?: number;
  itemId?: number;
  itemTitle?: string;
}

// Interface para resposta da API
export interface PontuacaoResponse {
  id: number;
  documentId?: string;
  jogo: TipoJogo;
  total: number;
  users_permissions_user: number;
  createdAt: string;
  updatedAt: string;
}

// Interface para informações do jogo
export interface InfoJogo {
  jogo: TipoJogo;
  multiplicador: number;
  limiteMinimo: number;
  limiteMaximo: number;
  descricao: string;
}

// Configuração dos multiplicadores e limites por jogo
const CONFIG_JOGOS: Record<TipoJogo, InfoJogo> = {
  quiz: {
    jogo: "quiz",
    multiplicador: 1,
    limiteMinimo: 0,
    limiteMaximo: 1000,
    descricao: "Quiz",
  },
  memoria: {
    jogo: "memoria",
    multiplicador: 1.5,
    limiteMinimo: 0,
    limiteMaximo: 1500,
    descricao: "Jogo da Memória",
  },
  cacapalavras: {
    jogo: "cacapalavras",
    multiplicador: 1.2,
    limiteMinimo: 0,
    limiteMaximo: 1200,
    descricao: "Caça-Palavras",
  },
  palavracruzada: {
    jogo: "palavracruzada",
    multiplicador: 2,
    limiteMinimo: 0,
    limiteMaximo: 2000,
    descricao: "Palavras Cruzadas",
  },
};

/**
 * Valida o tipo de jogo
 */
function validarTipoJogo(jogo: string): jogo is TipoJogo {
  return Object.keys(CONFIG_JOGOS).includes(jogo);
}

/**
 * Calcula a pontuação com multiplicador
 */
function calcularPontuacao(
  acertos: number,
  totalPerguntas: number,
  multiplicador: number,
): number {
  const percentual = (acertos / totalPerguntas) * 100;
  const pontuacaoCalculada = (percentual / 100) * 100 * multiplicador;
  return Math.round(pontuacaoCalculada);
}

/**
 * Valida os dados de entrada
 */
function validarDados(data: CriarPontuacaoDTO): {
  valido: boolean;
  erro?: string;
} {
  // Validar tipo de jogo
  if (!validarTipoJogo(data.jogo)) {
    return { valido: false, erro: `Tipo de jogo inválido: ${data.jogo}` };
  }

  // Validar acertos
  if (data.acertos < 0) {
    return { valido: false, erro: "Acertos não pode ser negativo" };
  }

  // Validar total de perguntas
  if (data.totalPerguntas <= 0) {
    return { valido: false, erro: "Total de perguntas deve ser maior que 0" };
  }

  // Validar que acertos não excede total
  if (data.acertos > data.totalPerguntas) {
    return {
      valido: false,
      erro: "Acertos não pode exceder o total de perguntas",
    };
  }

  return { valido: true };
}

/**
 * Obtém informações sobre um jogo
 */
export async function getInfoJogo(jogo: TipoJogo): Promise<InfoJogo | null> {
  try {
    const response = await api.get<{ data: InfoJogo }>(
      `/pontuacoes/info-jogo?jogo=${jogo}`,
    );
    return response.data.data || CONFIG_JOGOS[jogo];
  } catch (error) {
    console.warn(
      `Erro ao buscar info do jogo ${jogo}, usando config local`,
      error,
    );
    return CONFIG_JOGOS[jogo];
  }
}

/**
 * Cria uma nova pontuação
 */
export async function criarPontuacao(
  data: CriarPontuacaoDTO,
): Promise<{ sucesso: boolean; pontuacao?: PontuacaoResponse; erro?: string }> {
  try {
    // Validar dados
    const validacao = validarDados(data);
    if (!validacao.valido) {
      return { sucesso: false, erro: validacao.erro };
    }

    const response = await api.post<{ data: PontuacaoResponse }>(
      "/pontuacoes",
      {
        data: {
          jogo: data.jogo,
          acertos: data.acertos,
          totalPerguntas: data.totalPerguntas,
          users_permissions_user: data.users_permissions_user,
        },
      },
    );

    if (response.data?.data) {
      return { sucesso: true, pontuacao: response.data.data };
    }

    return { sucesso: false, erro: "Resposta inválida do servidor" };
  } catch (error: any) {
    const mensagem =
      error.response?.data?.error?.message ||
      error.message ||
      "Erro ao criar pontuação";
    console.error("Erro ao criar pontuação:", error);
    return { sucesso: false, erro: mensagem };
  }
}

/**
 * Atualiza uma pontuação existente
 */
export async function atualizarPontuacao(
  id: number,
  data: Partial<CriarPontuacaoDTO>,
): Promise<{ sucesso: boolean; pontuacao?: PontuacaoResponse; erro?: string }> {
  try {
    // Validar dados parciais
    if (data.jogo && !validarTipoJogo(data.jogo)) {
      return { sucesso: false, erro: `Tipo de jogo inválido: ${data.jogo}` };
    }

    const response = await api.put<{ data: PontuacaoResponse }>(
      `/pontuacoes/${id}`,
      {
        data: {
          jogo: data.jogo,
          acertos: data.acertos,
          totalPerguntas: data.totalPerguntas,
          users_permissions_user: data.users_permissions_user,
        },
      },
    );

    if (response.data?.data) {
      return { sucesso: true, pontuacao: response.data.data };
    }

    return { sucesso: false, erro: "Resposta inválida do servidor" };
  } catch (error: any) {
    const mensagem =
      error.response?.data?.error?.message ||
      error.message ||
      "Erro ao atualizar pontuação";
    console.error("Erro ao atualizar pontuação:", error);
    return { sucesso: false, erro: mensagem };
  }
}

/**
 * Busca pontuações do usuário
 */
export async function getPontuacoesUsuario(
  userId: number,
  jogo?: TipoJogo,
): Promise<PontuacaoResponse[]> {
  try {
    let url = `/pontuacoes?filters[users_permissions_user][id][$eq]=${userId}`;
    if (jogo) {
      url += `&filters[jogo][$eq]=${jogo}`;
    }
    url += "&sort=createdAt:desc";

    const response = await api.get<{ data: PontuacaoResponse[] }>(url);
    return response.data?.data || [];
  } catch (error) {
    console.error("Erro ao buscar pontuações do usuário:", error);
    return [];
  }
}

/**
 * Busca pontuação por ID
 */
export async function getPontuacaoById(
  id: number,
): Promise<PontuacaoResponse | null> {
  try {
    const response = await api.get<{ data: PontuacaoResponse }>(
      `/pontuacoes/${id}`,
    );
    return response.data?.data || null;
  } catch (error) {
    console.error("Erro ao buscar pontuação:", error);
    return null;
  }
}

/**
 * Deleta uma pontuação
 */
export async function deletarPontuacao(id: number): Promise<boolean> {
  try {
    await api.delete(`/pontuacoes/${id}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar pontuação:", error);
    return false;
  }
}

/**
 * Obtém estatísticas gerais de pontuação do usuário
 */
export async function getEstatisticasUsuario(userId: number): Promise<{
  totalPontos: number;
  totalJogos: number;
  jogosPorTipo: Record<TipoJogo, number>;
} | null> {
  try {
    const pontuacoes = await getPontuacoesUsuario(userId);

    if (pontuacoes.length === 0) {
      return {
        totalPontos: 0,
        totalJogos: 0,
        jogosPorTipo: {} as Record<TipoJogo, number>,
      };
    }

    const totalPontos = pontuacoes.reduce((acc, p) => acc + p.total, 0);
    const jogosPorTipo: Record<string, number> = {};

    pontuacoes.forEach((p) => {
      jogosPorTipo[p.jogo] = (jogosPorTipo[p.jogo] || 0) + 1;
    });

    return {
      totalPontos,
      totalJogos: pontuacoes.length,
      jogosPorTipo: jogosPorTipo as Record<TipoJogo, number>,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return null;
  }
}

/**
 * Obtém configuração local de um jogo (sem fazer requisição)
 */
export function getConfigJogo(jogo: TipoJogo): InfoJogo {
  return CONFIG_JOGOS[jogo];
}

/**
 * Valida se um valor de pontuação está dentro dos limites do jogo
 */
export function validarLimitePontuacao(
  jogo: TipoJogo,
  pontuacao: number,
): boolean {
  const config = CONFIG_JOGOS[jogo];
  return pontuacao >= config.limiteMinimo && pontuacao <= config.limiteMaximo;
}

export default {
  getInfoJogo,
  criarPontuacao,
  atualizarPontuacao,
  getPontuacoesUsuario,
  getPontuacaoById,
  deletarPontuacao,
  getEstatisticasUsuario,
  getConfigJogo,
  validarLimitePontuacao,
};
