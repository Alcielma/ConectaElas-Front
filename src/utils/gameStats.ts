import { TipoJogo } from "../Services/PontuacaoService";
import { GameTypeStats, UserGameStats, PontuacaoItem } from "../components/MinigamesProgress/types";

export const createEmptyGameStat = (userId: number, userName: string, jogo: TipoJogo): UserGameStats => ({
  userId,
  userName,
  jogoType: jogo,
  scores: [],
  totalPoints: 0,
  avgPoints: 0,
  lastScore: 0,
  lastDate: "",
});

export const calculateGameTypeStats = (scores: PontuacaoItem[]): GameTypeStats[] => {
  const gameStats: Record<TipoJogo, GameTypeStats> = {
    quiz: {
      jogo: "quiz",
      descricao: "Quiz",
      totalPontos: 0,
      totalJogos: 0,
      melhorPontuacao: 0,
      mediaPerJogo: 0,
    },
    memoria: {
      jogo: "memoria",
      descricao: "Jogo da Memória",
      totalPontos: 0,
      totalJogos: 0,
      melhorPontuacao: 0,
      mediaPerJogo: 0,
    },
    cacapalavras: {
      jogo: "cacapalavras",
      descricao: "Caça-Palavras",
      totalPontos: 0,
      totalJogos: 0,
      melhorPontuacao: 0,
      mediaPerJogo: 0,
    },
    palavracruzada: {
      jogo: "palavracruzada",
      descricao: "Palavras Cruzadas",
      totalPontos: 0,
      totalJogos: 0,
      melhorPontuacao: 0,
      mediaPerJogo: 0,
    },
  };

  scores.forEach((score) => {
    if (gameStats[score.jogo]) {
      gameStats[score.jogo].totalPontos += score.total;
      gameStats[score.jogo].totalJogos += 1;
      gameStats[score.jogo].melhorPontuacao = Math.max(
        gameStats[score.jogo].melhorPontuacao,
        score.total,
      );
    }
  });

  Object.values(gameStats).forEach((stat) => {
    if (stat.totalJogos > 0) {
      stat.mediaPerJogo = Math.round(stat.totalPontos / stat.totalJogos);
    }
  });

  return Object.values(gameStats).filter((s) => s.totalJogos > 0);
};

export const calculateUserGameStats = (
  scores: PontuacaoItem[],
  targetUserId: number,
  userName: string
): UserGameStats[] => {
  const gameMap: Partial<Record<TipoJogo, UserGameStats>> = {};

  scores.forEach((score) => {
    const key = score.jogo;
    if (!gameMap[key]) {
      gameMap[key] = createEmptyGameStat(targetUserId, userName, key);
    }

    const current = gameMap[key]!;
    current.scores.push(score);
    current.totalPoints += score.total;
    current.lastScore = score.total;
    current.lastDate = new Date(score.createdAt).toLocaleDateString();
  });

  const userStats = Object.values(gameMap) as UserGameStats[];
  userStats.forEach((stat) => {
    stat.avgPoints = Math.round(stat.totalPoints / stat.scores.length);
  });

  return userStats;
};
