import React from "react";
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
} from "@ionic/react";
import { trash } from "ionicons/icons";
import { PontuacaoItem } from "./types";

interface ScoreHistoryProps {
  scores: PontuacaoItem[];
  onDelete: (score: PontuacaoItem) => void;
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ scores, onDelete }) => {
  return (
    <div className="scores-history">
      <h3>Histórico de Pontuações</h3>
      <IonList className="scores-list">
        {scores.map((score, idx) => (
          <IonItemSliding key={score.id}>
            <IonItem>
              <div className="score-item-content">
                <span className="score-item-number">#{idx + 1}</span>
                <div className="score-name-wrapper">
                  {score.itemTitle && (
                    <span className="score-name">{score.itemTitle}</span>
                  )}
                  <span className="score-points">{score.total} pontos</span>
                </div>
                <span className="score-date">
                  {new Date(score.createdAt).toLocaleDateString()}
                </span>
              </div>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption color="danger" onClick={() => onDelete(score)}>
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}
      </IonList>
    </div>
  );
};

export default ScoreHistory;
