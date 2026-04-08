import React, { useEffect, useState, useMemo } from "react";
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
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonAlert,
  IonToast,
  IonSearchbar,
  IonButton,
} from "@ionic/react";
import {
  gameControllerOutline,
  arrowBackOutline,
} from "ionicons/icons";
import { TipoJogo } from "../Services/PontuacaoService";
import { useMinigamesProgress } from "../hooks/useMinigamesProgress";
import UserList from "../components/MinigamesProgress/UserList";
import GameStatCard from "../components/MinigamesProgress/GameStatCard";
import UserGameCard from "../components/MinigamesProgress/UserGameCard";
import { PontuacaoItem } from "../components/MinigamesProgress/types";
import "./MinigamesProgress.css";

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
  const [searchText, setSearchText] = useState("");
  const [selectedGame, setSelectedGame] = useState<TipoJogo | "todos">("todos");
  const [assistantViewMode, setAssistantViewMode] = useState<"userList" | "userDetails">("userList");
  
  const {
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
  } = useMinigamesProgress(user, isAssistant, assistantViewMode);

  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<PontuacaoItem | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      if (isAssistant && assistantViewMode === "userList") {
        loadAllUsersData();
      } else {
        loadProgressData(selectedUser?.userId || user.id);
      }
    }
  }, [user, isAssistant, assistantViewMode, selectedUser]);

  const filteredUsers = useMemo(() => {
    if (searchText === "") return usersSummary;
    return usersSummary.filter((u) =>
      u.userName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, usersSummary]);

  const confirmDelete = (item: PontuacaoItem) => {
    setItemToDelete(item);
    setShowDeleteAlert(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const success = await handleDelete(itemToDelete.id);
    if (success) {
      setToastMessage("✅ Pontuação deletada com sucesso");
    } else {
      setToastMessage("❌ Erro ao deletar pontuação");
    }
    setShowDeleteAlert(false);
    setShowToast(true);
    setItemToDelete(null);
  };

  const handleUserSelect = (summary: any) => {
    setSelectedUser(summary);
    setAssistantViewMode("userDetails");
  };

  const handleBackToList = () => {
    setAssistantViewMode("userList");
    setSelectedUser(null);
  };

  const filteredGameStats = userGameStats.filter((stat) =>
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
            <IonTitle className="title-centered">Progresso dos Minijogos</IonTitle>
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
            {isAssistant && assistantViewMode === "userDetails" ? (
              <IonButton onClick={handleBackToList} fill="clear">
                <IonIcon slot="icon-only" icon={arrowBackOutline} style={{ color: "white" }} />
              </IonButton>
            ) : (
              <IonBackButton defaultHref="/tabs/games" />
            )}
          </IonButtons>
          <IonTitle className="title-centered">
            {isAssistant && assistantViewMode === "userList"
              ? "Usuários dos Minijogos"
              : selectedUser
              ? `Progresso de ${selectedUser.userName.split(" ")[0]}`
              : "Progresso dos Minijogos"}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isAssistant && assistantViewMode === "userList" ? (
          <>
            <IonSearchbar
              value={searchText}
              onIonChange={(e) => setSearchText(e.detail.value!)}
              placeholder="Buscar usuário..."
              className="user-searchbar"
            />
            <UserList 
              users={filteredUsers} 
              onSelect={handleUserSelect} 
              searchText={searchText} 
            />
          </>
        ) : progressData.length === 0 ? (
          <IonCard className="empty-state-card">
            <IonCardContent>
              <div className="empty-state">
                <IonIcon icon={gameControllerOutline} className="empty-icon" />
                <h2>Nenhuma pontuação registrada</h2>
                <p>Jogue um dos minijogos para começar a acompanhar seu progresso!</p>
              </div>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            <h2 className="progress-section-title">Resumo por Tipo de Jogo</h2>
            <div className="game-stats-list">
              {gameTypeStats.map((stat) => (
                <GameStatCard 
                  key={stat.jogo} 
                  stat={stat} 
                  color={CORES_JOGOS[stat.jogo]} 
                />
              ))}
            </div>

            <h2 className="progress-section-title">Estatísticas Detalhadas</h2>
            <div className="toggle-container">
              {(Object.keys(NOMES_JOGOS) as TipoJogo[]).map((jogo) => (
                <button
                  key={jogo}
                  className={`toggle-button ${selectedGame === jogo ? "active" : ""}`}
                  onClick={() => setSelectedGame(jogo)}
                >
                  {jogo === "cacapalavras" ? "Caça-P." : jogo === "palavracruzada" ? "Cruzadas" : NOMES_JOGOS[jogo]}
                </button>
              ))}
            </div>

            {filteredGameStats.length > 0 ? (
              filteredGameStats.map((gameStat) => (
                <UserGameCard
                  key={`${gameStat.userId}-${gameStat.jogoType}`}
                  gameStat={gameStat}
                  color={CORES_JOGOS[gameStat.jogoType]}
                  gameName={NOMES_JOGOS[gameStat.jogoType]}
                  onDelete={confirmDelete}
                />
              ))
            ) : (
              <IonCard className="empty-filter-card">
                <IonCardContent>
                  <p>Nenhuma pontuação para este jogo.</p>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirmar exclusão"
          message="Tem certeza que deseja excluir esta pontuação? Esta ação não pode ser desfeita."
          buttons={[
            { text: "Cancelar", role: "cancel" },
            { text: "Excluir", handler: executeDelete, cssClass: "alert-button-confirm" },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default MinigamesProgress;
