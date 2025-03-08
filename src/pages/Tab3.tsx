import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAuth } from "../Contexts/AuthContext";
import { useHistory } from "react-router-dom";
import "./Tab3.css";

const Tab3: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="profile-page-fullscreen">
          <div className="profile-header">
            <h2 className="profile-name">{"Usuário:  " + user?.name}</h2>
          </div>

          <div className="profile-info">
            <div className="profile-section">
              <h3 className="profile-label">Email:</h3>
              <p className="profile-data">{user?.email}</p>
            </div>
          </div>

          <div className="profile-footer">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
