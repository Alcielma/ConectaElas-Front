import { useState, useEffect } from "react";
import { 
  getPontuacoesUsuario, 
  getAllPontuacoes, 
  deletarPontuacao 
} from "../Services/PontuacaoService";
import { 
  PontuacaoItem, 
  UserSummary, 
  UserGameStats, 
  GameTypeStats 
} from "../components/MinigamesProgress/types";
import { calculateGameTypeStats, calculateUserGameStats } from "../utils/gameStats";

export const useMinigamesProgress = (user: any, isAssistant: boolean, assistantViewMode: string) => {
  const [progressData, setProgressData] = useState<PontuacaoItem[]>([]);
  const [userGameStats, setUserGameStats] = useState<UserGameStats[]>([]);
  const [gameTypeStats, setGameTypeStats] = useState<GameTypeStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [usersSummary, setUsersSummary] = useState<UserSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  const loadAllUsersData = async () => {
    setLoading(true);
    try {
      const allPontuacoes = await getAllPontuacoes();
      
      const userMap = new Map<number, { 
        userId: number; 
        userName: string; 
        totalGames: number; 
        totalPoints: number; 
        lastDate: string 
      }>();

      allPontuacoes.forEach(p => {
        const userData = p.users_permissions_user;
        if (!userData) return;

        const userId = typeof userData === 'number' ? userData : (userData as any).id;
        const userName = typeof userData === 'object' && userData !== null 
          ? ((userData as any).name || (userData as any).nome || (userData as any).username) 
          : `Usuário ${userId}`;

        const current = userMap.get(userId) || {
          userId,
          userName,
          totalGames: 0,
          totalPoints: 0,
          lastDate: p.createdAt
        };

        current.totalGames += 1;
        current.totalPoints += p.total;
        if (new Date(p.createdAt) > new Date(current.lastDate)) {
          current.lastDate = p.createdAt;
        }

        userMap.set(userId, current);
      });

      const summaries: UserSummary[] = Array.from(userMap.values()).map(u => ({
        ...u,
        lastGameDate: new Date(u.lastDate).toLocaleDateString()
      }));

      setUsersSummary(summaries);
    } catch (error) {
      console.error("Erro ao carregar dados de todos os usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressData = async (targetUserId: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const pontuacoes = await getPontuacoesUsuario(targetUserId);

      const scores: PontuacaoItem[] = pontuacoes.map((p) => ({
        id: p.id,
        jogo: p.jogo,
        total: p.total,
        createdAt: p.createdAt,
        users_permissions_user: p.users_permissions_user,
        itemTitle: p.itemTitle || p.item_title || "",
      }));

      // Carregar históricos de quiz do localStorage
      if (targetUserId === user.id) {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`quizHistory_${user.id}_`)) {
              const quizDataRaw = localStorage.getItem(key);
              if (quizDataRaw) {
                const quizData = JSON.parse(quizDataRaw);
                const jaExiste = scores.find(s => s.jogo === 'quiz' && s.itemTitle === quizData.quizTitle && s.total === quizData.acertos);
                
                if (!jaExiste) {
                  scores.push({
                    id: Math.random(),
                    jogo: "quiz",
                    total: quizData.acertos,
                    createdAt: quizData.dataRealizacao.split('/').reverse().join('-'),
                    users_permissions_user: user.id,
                    itemTitle: quizData.quizTitle
                  });
                }
              }
            }
          }
        } catch (e) {
          console.error("Erro ao carregar quiz do localStorage:", e);
        }
      }

      setProgressData(scores);
      setGameTypeStats(calculateGameTypeStats(scores));
      
      const currentUserName = selectedUser?.userName || user.name || user.nome || user.username || "Usuário";
      setUserGameStats(calculateUserGameStats(scores, targetUserId, currentUserName));
      
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      const success = await deletarPontuacao(itemId);
      if (success) {
        setProgressData((prev) => prev.filter((p) => p.id !== itemId));
        loadProgressData(selectedUser?.userId || user!.id);
        return true;
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
    return false;
  };

  return {
    progressData,
    userGameStats,
    gameTypeStats,
    loading,
    usersSummary,
    selectedUser,
    setSelectedUser,
    loadAllUsersData,
    loadProgressData,
    handleDelete
  };
};
