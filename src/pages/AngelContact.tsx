import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonLoading,
  IonModal,
  IonToast,
} from "@ionic/react";
import {
  callSharp,
  addCircleOutline,
  closeOutline,
  trash,
} from "ionicons/icons";
import { useAuth } from "../Contexts/AuthContext";
import AngelContactService, {
  AngelContact,
} from "../Services/AngelContactService";

import "./AngelContact.css";

const AngelContactPage: React.FC = () => {
  const { authToken, user } = useAuth();
  const [contacts, setContacts] = useState<AngelContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authToken || !user) return;

    setLoading(true);
    AngelContactService.fetchContacts(authToken, user.id).then((data) => {
      setContacts(data);
      setLoading(false);
    });
  }, [authToken, user]);

  const handleAddContact = async () => {
    if (!nome || !numero || !user) return;

    const success = await AngelContactService.addContact(
      authToken!,
      nome,
      numero,
      user.id
    );
    if (success) {
      setShowToast(true);
      setShowModal(false);
      setNome("");
      setNumero("");

      const updatedContacts = await AngelContactService.fetchContacts(
        authToken!,
        user.id
      );
      setContacts(updatedContacts);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!user) return;

    console.log(`Tentando excluir o contato com ID: ${contactId}`);

    const success = await AngelContactService.deleteContact(
      authToken!,
      contactId
    );
    if (success) {
      console.log("Contato excluído com sucesso!");

      const updatedContacts = await AngelContactService.fetchContacts(
        authToken!,
        user.id
      );
      setContacts(updatedContacts);
    } else {
      console.error("Falha ao excluir o contato!");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Contatos do Anjo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <div className="angel-contact-content">
        {loading && (
          <IonLoading isOpen={loading} message="Carregando contatos..." />
        )}

        <div className="angel-contact-container">
          {contacts.length === 0 && !loading && (
            <p className="aviso">Nenhum contato cadastrado.</p>
          )}

          {contacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <a href={`tel:${contact.Numero}`} className="contact-link">
                <div className="contact-info">
                  <IonIcon icon={callSharp} className="contact-icon" />
                  <div>
                    <h3>{contact.Nome}</h3>
                    <p>{contact.Numero}</p>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteContact(contact.id);
                  }}
                >
                  <IonIcon icon={trash} />
                </button>
              </a>
            </div>
          ))}

          <button
            className="add-contact-btn"
            onClick={() => setShowModal(true)}
          >
            <IonIcon icon={addCircleOutline} />
            Adicionar Contato
          </button>
        </div>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              <IonIcon icon={closeOutline} />
            </button>
            <h2>Adicionar Contato do Anjo</h2>

            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome"
              />
            </div>

            <div className="form-group">
              <label>Número</label>
              <input
                type="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Digite o número"
              />
            </div>

            <button className="save-contact-btn" onClick={handleAddContact}>
              Salvar Contato
            </button>
          </div>
        </IonModal>

        <IonToast
          isOpen={showToast}
          message="Contato adicionado!"
          duration={1500}
        />
      </div>
    </IonPage>
  );
};

export default AngelContactPage;
