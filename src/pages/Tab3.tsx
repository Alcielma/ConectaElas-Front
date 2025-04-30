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
  const [toastMessage, setToastMessage] = useState("");
  const [isHiding, setIsHiding] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    username: "",
  });

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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUsername = (username: string) => {
    return username.length >= 3 && username.length <= 30;
  };

  const handleLogout = () => {
    logout();
    history.replace("/login");
  };

  const handleEditEmail = async () => {
    // Reset errors
    setErrors((prev) => ({ ...prev, email: "" }));

    // Validation
    if (!newEmail.trim()) {
      setErrors((prev) => ({ ...prev, email: "E-mail é obrigatório" }));
      return;
    }

    if (!validateEmail(newEmail)) {
      setErrors((prev) => ({
        ...prev,
        email: "Por favor, insira um e-mail válido",
      }));
      return;
    }

    if (newEmail === user?.email) {
      setShowEditEmailModal(false);
      return;
    }

    const success = await AuthService.updateEmail(
      user!.id,
      newEmail,
      authToken!
    );

    if (success) {
      updateUser({ email: newEmail });
      setToastMessage("E-mail atualizado com sucesso!");
      setShowToast(true);
      setShowEditEmailModal(false);
    } else {
      setToastMessage("Falha ao atualizar o e-mail");
      setShowToast(true);
    }
  };

  const handleEditUsername = async () => {
    // Reset errors
    setErrors((prev) => ({ ...prev, username: "" }));

    // Validation
    if (!newUsername.trim()) {
      setErrors((prev) => ({
        ...prev,
        username: "Nome de usuário é obrigatório",
      }));
      return;
    }

    if (!validateUsername(newUsername)) {
      setErrors((prev) => ({
        ...prev,
        username: "Nome deve ter entre 3 e 30 caracteres",
      }));
      return;
    }

    if (newUsername === user?.name) {
      setShowEditUsernameModal(false);
      return;
    }

    const success = await AuthService.updateUsername(user!.id, newUsername);

    if (success) {
      updateUser({ name: newUsername });
      setToastMessage("Nome de usuário atualizado com sucesso!");
      setShowToast(true);
      setShowEditUsernameModal(false);
    } else {
      setToastMessage("Falha ao atualizar o nome de usuário");
      setShowToast(true);
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
                  onClick={() => {
                    setNewUsername(user?.name || "");
                    setErrors((prev) => ({ ...prev, username: "" }));
                    setShowEditUsernameModal(true);
                  }}
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
                  onClick={() => {
                    setNewEmail(user?.email || "");
                    setErrors((prev) => ({ ...prev, email: "" }));
                    setShowEditEmailModal(true);
                  }}
                >
                  <IonIcon icon={pencilSharp} />
                </button>
              </div>
            </div>

            <button
              className="profile-section profile-link-button"
              onClick={() => history.push("/tabs/sobre")}
            >
              <div className="saiba-mais-box">
                <h3 className="profile-label">
                  {" "}
                  Saiba mais sobre o Conecta Elas
                </h3>
              </div>
            </button>
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
              className={`modal-input ${errors.email ? "input-error" : ""}`}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Novo E-mail"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </Modal>

          <Modal
            isOpen={showEditUsernameModal}
            onClose={() => setShowEditUsernameModal(false)}
            onConfirm={handleEditUsername}
            title="Editar Nome de Usuário"
          >
            <input
              type="text"
              className={`modal-input ${errors.username ? "input-error" : ""}`}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Novo Nome de Usuário"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </Modal>

          {showToast && (
            <div className={`toast ${isHiding ? "hide" : ""}`}>
              {toastMessage}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
