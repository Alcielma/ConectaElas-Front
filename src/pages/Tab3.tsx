import React, { useState } from "react";

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { IonIcon } from "@ionic/react";
import { pencilSharp } from "ionicons/icons";
import { useAuth } from "../Contexts/AuthContext";
import Modal from "../components/Modal";
import { useHistory } from "react-router-dom";
import "./Tab3.css";

const Tab3: React.FC = () => {
  const { user, logout, authToken } = useAuth();
  const history = useHistory();

  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showEditUsernameModal, setShowEditUsernameModal] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newUsername, setNewUsername] = useState(user?.name || "");
  const [showToast, setShowToast] = useState(false);

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const handleEditEmail = async () => {
    if (newEmail !== user?.email) {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: newEmail,
        }),
      });
      if (response.ok) {
        setShowToast(true);
        setShowEditEmailModal(false);
      }
    } else {
      setShowEditEmailModal(false);
    }
  };

  const handleEditUsername = async () => {
    if (newUsername !== user?.name) {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: newUsername,
        }),
      });
      if (response.ok) {
        setShowToast(true);
        setShowEditUsernameModal(false);
      }
    } else {
      setShowEditUsernameModal(false);
    }
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
            <h2 className="profile-name">{"Informações gerais"}</h2>
          </div>

          <div className="profile-info">
            <div className="profile-section">
              <div className="info-section">
                <div className="info">
                  <h3 className="profile-label">Nome: </h3>
                  <p className="profile-data">{user?.name}</p>
                </div>
                <button
                  className="edit-button"
                  onClick={() => setShowEditUsernameModal(true)}
                >
                  <IonIcon icon={pencilSharp} />
                </button>
              </div>
              <div className="info-section">
                <div className="info">
                  <h3 className="profile-label">Email: </h3>
                  <p className="profile-data">{user?.email}</p>
                </div>
                <button
                  className="edit-button"
                  onClick={() => setShowEditEmailModal(true)}
                >
                  <IonIcon icon={pencilSharp} />
                </button>
              </div>
            </div>
          </div>

          <div className="profile-footer">
            <button className="logout-button" onClick={handleLogout}>
              Sair da conta
            </button>
          </div>
          <Modal
            isOpen={showEditEmailModal}
            onClose={() => setShowEditEmailModal(false)}
            onConfirm={handleEditEmail}
            title="Editar E-mail"
          >
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Novo E-mail"
            />
          </Modal>

          <Modal
            isOpen={showEditUsernameModal}
            onClose={() => setShowEditUsernameModal(false)}
            onConfirm={handleEditUsername}
            title="Editar Nome de Usuário"
          >
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Novo Nome de Usuário"
            />
          </Modal>

          {showToast && (
            <div className="toast">Alteração realizada com sucesso!</div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
