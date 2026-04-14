import React from "react";
import {
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonIcon,
} from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import { UserSummary } from "./types";

interface UserListProps {
  users: UserSummary[];
  onSelect: (user: UserSummary) => void;
  searchText: string;
}

const UserList: React.FC<UserListProps> = ({ users, onSelect, searchText }) => {
  if (users.length === 0) {
    return (
      <div className="no-progress">
        <h2>Nenhum usuário encontrado</h2>
        <p>
          {searchText
            ? "Tente outro termo de busca."
            : "Nenhum histórico de minijogo encontrado."}
        </p>
      </div>
    );
  }

  return (
    <IonList className="user-list">
      {users.map((userSummary) => (
        <IonItem
          key={userSummary.userId}
          button
          onClick={() => onSelect(userSummary)}
          className="user-item"
          lines="none"
        >
          <IonAvatar slot="start">
            <div className="user-avatar-placeholder">
              {userSummary.userName.charAt(0).toUpperCase()}
            </div>
          </IonAvatar>
          <IonLabel>
            <h2 className="user-name">{userSummary.userName}</h2>
            <p className="user-last-quiz">
              Último jogo: {userSummary.lastGameDate}
            </p>
          </IonLabel>
          <div className="user-stats" slot="end">
            <div className="stat-badge">
              <span className="stat-text">Jogos :</span>
              <span className="stat-number">{userSummary.totalGames}</span>
            </div>
            <div className="stat-badge score success">
              <span className="stat-number">{userSummary.totalPoints}</span>
              <span className="stat-text">Pontos</span>
            </div>
          </div>
          <IonIcon icon={chevronForwardOutline} slot="end" color="medium" />
        </IonItem>
      ))}
    </IonList>
  );
};

export default UserList;
