import React from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
} from "@ionic/react";
import { GameTypeStats } from "./types";

interface GameStatCardProps {
  stat: GameTypeStats;
  color: string;
}

const GameStatCard: React.FC<GameStatCardProps> = ({ stat, color }) => {
  return (
    <IonCard key={stat.jogo} className="game-stat-card">
      <IonCardHeader>
        <div className="game-stat-header">
          <IonCardTitle className="game-stat-title">
            {stat.descricao}
          </IonCardTitle>
          <IonBadge color={color}>
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
  );
};

export default GameStatCard;
