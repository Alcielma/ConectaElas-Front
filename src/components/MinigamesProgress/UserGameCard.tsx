import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonBadge,
  IonIcon,
} from "@ionic/react";
import { gameControllerOutline } from "ionicons/icons";
import { UserGameStats, PontuacaoItem } from "./types";
import ScoreHistory from "./ScoreHistory";

interface UserGameCardProps {
  gameStat: UserGameStats;
  color: string;
  gameName: string;
  onDelete: (score: PontuacaoItem) => void;
}

const UserGameCard: React.FC<UserGameCardProps> = ({ gameStat, color, gameName, onDelete }) => {
  return (
    <IonCard className="user-game-card">
      <IonCardHeader>
        <div className="user-game-header">
          <div className="game-info">
            <IonIcon icon={gameControllerOutline} className="game-icon" />
            <span className="game-name">{gameName}</span>
          </div>
          <IonBadge color={color}>{gameStat.scores.length} times</IonBadge>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">Total de Pontos</span>
            <span className="stat-big-value">{gameStat.totalPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Média</span>
            <span className="stat-big-value">{gameStat.avgPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Último Jogo</span>
            <span className="stat-big-value">{gameStat.lastScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Data</span>
            <span className="stat-date">{gameStat.lastDate}</span>
          </div>
        </div>
        <ScoreHistory scores={gameStat.scores} onDelete={onDelete} />
      </IonCardContent>
    </IonCard>
  );
};

export default UserGameCard;
