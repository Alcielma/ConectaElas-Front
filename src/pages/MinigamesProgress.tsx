import React, { useEffect, useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonIcon,
  IonSpinner,
  IonItem,
  IonLabel,
  IonList,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonToast,
  IonAvatar,
  IonSearchbar,
  IonButton,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  timeOutline,
  ribbonOutline,
  trash,
  personOutline,
  chevronForwardOutline,
  gameControllerOutline,
} from "ionicons/icons";
import {
  getPontuacoesUsuario,
  deletarPontuacao,
  TipoJogo,
  getConfigJogo,
  getEstatisticasUsuario,
} from "../Services/PontuacaoService";
import "./MinigamesProgress.css";

interface PontuacaoItem {
  id: number;
  jogo: TipoJogo;
  total: number;
  createdAt: string;
  users_permissions_user: number;
  itemId?: number;
  itemTitle?: string;
}

interface UserGameStats {
  userId: number;
  userName: string;
  jogoType: TipoJogo;
  scores: PontuacaoItem[];
  totalPoints: number;
  avgPoints: number;
  lastScore: number;
  lastDate: string;
}

interface GameTypeStats {
  jogo: TipoJogo;
  descricao: string;
  totalPontos: number;
  totalJogos: number;
  melhorPontuacao: number;
  mediaPerJogo: number;
}

const NOMES_JOGOS: Record<TipoJogo, string> = {
  quiz: "Quiz",
  memoria: "Jogo da Memória",
  cacapalavras: "Caça-Palavras",
  palavracruzada: "Palavras Cruzadas",
};

const CORES_JOGOS: Record<TipoJogo, string> = {
  quiz: "primary",
  memoria: "secondary",
  cacapalavras: "tertiary",
  palavracruzada: "warning",
};

const MinigamesProgress: React.FC = () => {
  const { user, isAssistant } = useAuth();
  const [progressData, setProgressData] = useState<PontuacaoItem[]>([]);
  const [userGameStats, setUserGameStats] = useState<UserGameStats[]>([]);
  const [gameTypeStats, setGameTypeStats] = useState<GameTypeStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<PontuacaoItem | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [selectedGame, setSelectedGame] = useState<TipoJogo | "todos">("todos");
  const [viewMode, setViewMode] = useState<"overview" | "byGame">("overview");

  useEffect(() => {
    if (user?.id) {
      loadProgressData();
    }
  }, [user, isAssistant]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;

      const pontuacoes = await getPontuacoesUsuario(user.id);

      console.log("Pontuações carregadas:", pontuacoes);

      if (!pontuacoes || pontuacoes.length === 0) {
        console.log("Nenhuma pontuação encontrada");
        setProgressData([]);
        setUserGameStats([]);
        setGameTypeStats([]);
        setLoading(false);
        return;
      }

      const scores: PontuacaoItem[] = pontuacoes.map((p) => ({
        id: p.id,
        jogo: p.jogo,
        total: p.total,
        createdAt: p.createdAt,
        users_permissions_user: p.users_permissions_user,
      }));

      setProgressData(scores);

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

      setGameTypeStats(
        Object.values(gameStats).filter((s) => s.totalJogos > 0),
      );

      const userStats: UserGameStats[] = [];
      const gameMap: Record<TipoJogo, UserGameStats> = {};

      scores.forEach((score) => {
        if (!gameMap[score.jogo]) {
          gameMap[score.jogo] = {
            userId: user.id,
            userName: user.name || user.nome || user.username || "Você",
            jogoType: score.jogo,
            scores: [],
            totalPoints: 0,
            avgPoints: 0,
            lastScore: 0,
            lastDate: "",
          };
        }

        gameMap[score.jogo].scores.push(score);
        gameMap[score.jogo].totalPoints += score.total;
        gameMap[score.jogo].lastScore = score.total;
        gameMap[score.jogo].lastDate = new Date(
          score.createdAt,
        ).toLocaleDateString();
      });

      Object.values(gameMap).forEach((stat) => {
        stat.avgPoints = Math.round(stat.totalPoints / stat.scores.length);
        userStats.push(stat);
      });

      setUserGameStats(userStats);
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
      setToastMessage("Erro ao carregar dados de progresso");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item: PontuacaoItem) => {
    setItemToDelete(item);
    setShowDeleteAlert(true);
  };

  const deleteProgressItem = async () => {
    if (!itemToDelete) return;

    try {
      const success = await deletarPontuacao(itemToDelete.id);
      if (success) {
        setToastMessage("✅ Pontuação deletada com sucesso");
        setProgressData((prev) => prev.filter((p) => p.id !== itemToDelete.id));
        loadProgressData();
      } else {
        setToastMessage("❌ Erro ao deletar pontuação");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setToastMessage("❌ Erro ao deletar pontuação");
    } finally {
      setShowDeleteAlert(false);
      setShowToast(true);
      setItemToDelete(null);
    }
  };

  const getGameColor = (
    pontos: number,
    jogo: TipoJogo,
  ): "success" | "warning" | "danger" => {
    const config = getConfigJogo(jogo);
    const percentual = (pontos / config.limiteMaximo) * 100;
    if (percentual >= 70) return "success";
    if (percentual >= 50) return "warning";
    return "danger";
  };

  const fornecerStats = userGameStats.filter((stat) =>
    selectedGame === "todos" ? true : stat.jogoType === selectedGame,
  );

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="header-gradient">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/games" />
            </IonButtons>
            <IonTitle className="title-centered">
              Progresso dos Minijogos
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Carregando progresso...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/games" />
          </IonButtons>
          <IonTitle className="title-centered">
            Progresso dos Minijogos
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {progressData.length === 0 ? (
          <IonCard className="empty-state-card">
            <IonCardContent>
              <div className="empty-state">
                <IonIcon icon={gameControllerOutline} className="empty-icon" />
                <h2>Nenhuma pontuação registrada</h2>
                <p>
                  Jogue um dos minijogos para começar a acompanhar seu
                  progresso!
                </p>
              </div>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            {/* Estatísticas por Tipo de Jogo */}
            <h2 className="progress-section-title">Resumo por Tipo de Jogo</h2>
            <IonList className="game-stats-list">
              {gameTypeStats.map((stat) => (
                <IonCard key={stat.jogo} className="game-stat-card">
                  <IonCardHeader>
                    <div className="game-stat-header">
                      <IonCardTitle className="game-stat-title">
                        {stat.descricao}
                      </IonCardTitle>
                      <IonBadge color={CORES_JOGOS[stat.jogo]}>
                        {stat.totalJogos} vezes
                      </IonBadge>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="game-stat-row">
                      <span className="stat-label">Pontos Totais:</span>
                      <span className="stat-value highlight">
                        {stat.totalPontos}
                      </span>
                    </div>
                    <div className="game-stat-row">
                      <span className="stat-label">Melhor Pontuação:</span>
                      <span className="stat-value">{stat.melhorPontuacao}</span>
                    </div>
                    <div className="game-stat-row">
                      <span className="stat-label">Média por Jogo:</span>
                      <span className="stat-value">{stat.mediaPerJogo}</span>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>

            {/* Filtro por Tipo de Jogo */}
            <h2 className="progress-section-title">Estatísticas Detalhadas</h2>
            <IonSegment
              value={selectedGame}
              onIonChange={(e) => setSelectedGame(e.detail.value as any)}
            >
              <IonSegmentButton value="todos">Todos</IonSegmentButton>
              <IonSegmentButton value="quiz">Quiz</IonSegmentButton>
              <IonSegmentButton value="memoria">Memória</IonSegmentButton>
              <IonSegmentButton value="cacapalavras">Caça-P.</IonSegmentButton>
              <IonSegmentButton value="palavracruzada">
                Cruzadas
              </IonSegmentButton>
            </IonSegment>

            {/* Lista de Pontuações por Tipo de Jogo */}
            {fornecerStats.length > 0 ? (
              fornecerStats.map((gameStat) => (
                <IonCard
                  key={`${gameStat.userId}-${gameStat.jogoType}`}
                  className="user-game-card"
                >
                  <IonCardHeader>
                    <div className="user-game-header">
                      <div className="game-info">
                        <IonIcon
                          icon={gameControllerOutline}
                          className="game-icon"
                        />
                        <span className="game-name">
                          {NOMES_JOGOS[gameStat.jogoType]}
                        </span>
                      </div>
                      <IonBadge color={CORES_JOGOS[gameStat.jogoType]}>
                        {gameStat.scores.length} times
                      </IonBadge>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="stat-grid">
                      <div className="stat-item">
                        <span className="stat-label">Total de Pontos</span>
                        <span className="stat-big-value">
                          {gameStat.totalPoints}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Média</span>
                        <span className="stat-big-value">
                          {gameStat.avgPoints}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Último Jogo</span>
                        <span className="stat-big-value">
                          {gameStat.lastScore}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Data</span>
                        <span className="stat-date">{gameStat.lastDate}</span>
                      </div>
                    </div>

                    <div className="scores-history">
                      <h3>Histórico de Pontuações</h3>
                      <IonList className="scores-list">
                        {gameStat.scores.map((score, idx) => (
                          <IonItemSliding key={score.id}>
                            <IonItem>
                              <div className="score-item-content">
                                <span className="score-number">#{idx + 1}</span>
                                <div className="score-name-wrapper">
                                  {score.itemTitle && (
                                    <span className="score-name">
                                      {score.itemTitle}
                                    </span>
                                  )}
                                  <span className="score-points">
                                    {score.total} pontos
                                  </span>
                                </div>
                                <span className="score-date">
                                  {new Date(
                                    score.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </IonItem>
                            <IonItemOptions side="end">
                              <IonItemOption
                                color="danger"
                                onClick={() => confirmDelete(score)}
                              >
                                <IonIcon slot="icon-only" icon={trash} />
                              </IonItemOption>
                            </IonItemOptions>
                          </IonItemSliding>
                        ))}
                      </IonList>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            ) : (
              <IonCard className="empty-filter-card">
                <IonCardContent>
                  <p>Nenhuma pontuação para este tipo de jogo.</p>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirmar Exclusão"
          message="Tem certeza que deseja deletar esta pontuação?"
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
            },
            {
              text: "Deletar",
              role: "destructive",
              handler: deleteProgressItem,
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default MinigamesProgress;
