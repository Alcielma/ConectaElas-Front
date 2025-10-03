import api from "./api";

// Interface para respostas das perguntas
interface Resposta {
  id: number;
  documentId: string;
  Resposta: string;
  Correcao: boolean;
  Explicacao: string | null; // Campo para explicação, permitindo null
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  pontuacao: string | null;
}

// Interface para perguntas do quiz
interface Pergunta {
  id: number;
  documentId: string;
  Questao: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  respostas: Resposta[];
  opcoes?: string[];
  opcoesCorretas?: boolean[];
  opcoesExplicacoes?: string[]; // Array para explicações mapeadas
}

// Interface para o quiz
interface Quiz {
  id: number;
  documentId: string;
  Titulo: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  perguntas: Pergunta[];
}

// Interface para resposta da API
interface QuizResponse {
  data: Quiz[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Função para buscar todos quizzes com perguntas e respostas
export async function getAllQuizzes() {
  try {
    const response = await api.get("/quizzes?populate[perguntas][populate]=respostas");
    const quizResponse = response.data as QuizResponse;

    if (!quizResponse.data || quizResponse.data.length === 0) {
      console.log("Nenhum quiz encontrado na API");
      return {
        data: [],
        meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } }
      };
    }

    // Mapear opcoes, opcoesCorretas e opcoesExplicacoes
    quizResponse.data.forEach(quiz => {
      quiz.perguntas?.forEach(pergunta => {
        pergunta.respostas = pergunta.respostas ?? [];
        pergunta.opcoes = pergunta.respostas.map(r => r.Resposta);
        pergunta.opcoesCorretas = pergunta.respostas.map(r => r.Correcao);
        pergunta.opcoesExplicacoes = pergunta.respostas.map(r => r.Explicacao || "Sem explicação disponível.");
      });
    });

    return quizResponse;
  } catch (error: any) {
    console.error("Erro ao buscar quizzes:", error?.response?.data ?? error);
    return {
      data: [],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } }
    };
  }
}

// Função para buscar quiz por ID (filtrando localmente)
export async function getQuizById(id: number) {
  try {
    const response = await api.get("/quizzes?populate[perguntas][populate]=respostas");
    const quizzes = (response.data as QuizResponse).data ?? [];

    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) {
      console.error(`Quiz ${id} não encontrado.`);
      return null;
    }

    quiz.perguntas?.forEach(pergunta => {
      pergunta.respostas = pergunta.respostas ?? [];
      pergunta.opcoes = pergunta.respostas.map(r => r.Resposta);
      pergunta.opcoesCorretas = pergunta.respostas.map(r => r.Correcao);
      pergunta.opcoesExplicacoes = pergunta.respostas.map(r => r.Explicacao || "Sem explicação disponível.");
    });

    return { data: quiz };
  } catch (error: any) {
    console.error(`Erro ao buscar quiz ${id}:`, error?.response?.data ?? error);
    return null;
  }
}

// Interface para armazenar as respostas do usuário
export interface QuizResult {
  quizId: number;
  quizTitle: string;
  totalPerguntas: number;
  respostas: {
    perguntaId: number;
    pergunta: string;
    resposta: string;
    correta: boolean;
    corretaResposta: string;
    explicacao: string; // Explicação da resposta selecionada
  }[];
}