import React, { useState, useEffect } from "react";

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
import AuthService from "../Services/AuthService";

const Tab3: React.FC = () => {
  const { user, logout, authToken, updateUser } = useAuth();
  const history = useHistory();

  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showEditUsernameModal, setShowEditUsernameModal] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newUsername, setNewUsername] = useState(user?.name || "");

  const [showToast, setShowToast] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (showToast) {
      const hideTimer = setTimeout(() => {
        setIsHiding(true);
      }, 1500);

      const removeTimer = setTimeout(() => {
        setShowToast(false);
        setIsHiding(false);
      }, 2000);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showToast]);

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const handleEditEmail = async () => {
    if (newEmail !== user?.email) {
      const success = await AuthService.updateEmail(
        user!.id,
        newEmail,
        authToken!
      );
      if (success) {
        updateUser({ email: newEmail });
        setShowToast(true);
        setShowEditEmailModal(false);
      } else {
        console.error("Falha ao atualizar o e-mail");
      }
    } else {
      setShowEditEmailModal(false);
    }
  };

  const handleEditUsername = async () => {
    if (newUsername !== user?.name) {
      const success = await AuthService.updateUsername(
        user!.id,
        newUsername,
        authToken!
      );
      if (success) {
        updateUser({ name: newUsername });
        setShowToast(true);
        setShowEditUsernameModal(false);
      } else {
        console.error("Falha ao atualizar o nome de usuário");
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
              className="modal-input"
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
              className="modal-input"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Novo Nome de Usuário"
            />
          </Modal>

          {showToast && (
            <div className={`toast ${isHiding ? "hide" : ""}`}>
              Alteração realizada com sucesso!
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
