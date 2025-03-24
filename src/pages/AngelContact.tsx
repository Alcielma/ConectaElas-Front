import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonToast,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import {
  callSharp,
  addCircleOutline,
  closeOutline,
  trash,
  pencilSharp,
} from "ionicons/icons";
import { useAuth } from "../Contexts/AuthContext";
import AngelContactService, {
  AngelContact,
} from "../Services/AngelContactService";
import Modal from "../components/Modal";
import "./AngelContact.css";
import { IonLoading } from "@ionic/react";

const AngelContactPage: React.FC = () => {
  const { authToken, user } = useAuth();
  const [contacts, setContacts] = useState<AngelContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Modal de edição
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [selectedContactName, setSelectedContactName] = useState<string | null>(
    null
  );
  const [selectedContactNumber, setSelectedContactNumber] = useState<
    string | null
  >(null); // Número do contato
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    if (!authToken || !user) return;

    setLoading(true);
    AngelContactService.fetchContacts(authToken, user.id).then((data) => {
      setContacts(data);
      setLoading(false);
    });
  }, [authToken, user]);

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

  const handleDeleteContact = async () => {
    if (!selectedContactId || !user) return;

    setShowDeleteModal(false);

    const success = await AngelContactService.deleteContact(
      authToken!,
      selectedContactId
    );
    if (success) {
      setContacts((prevContacts) =>
        prevContacts.filter(
          (contact) => contact.documentId !== selectedContactId
        )
      );
    } else {
      console.error("Falha ao excluir o contato!");
    }
  };

  const handleEditContact = async () => {
    if (!selectedContactId || !user || !nome || !numero) return;

    const success = await AngelContactService.updateContact(
      authToken!,
      selectedContactId,
      nome,
      numero,
      user.id
    );

    if (success) {
      setShowToast(true);
      setShowEditModal(false);

      const updatedContacts = await AngelContactService.fetchContacts(
        authToken!,
        user.id
      );
      setContacts(updatedContacts);
    } else {
      console.error("Falha ao atualizar o contato");
    }
  };

  const openEditModal = (contact: AngelContact) => {
    setSelectedContactId(contact.documentId);
    setSelectedContactName(contact.Nome);
    setSelectedContactNumber(contact.Numero);
    setNome(contact.Nome);
    setNumero(contact.Numero);
    setShowEditModal(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="center-title">Contato do Anjo</IonTitle>
          <IonButtons slot="end">
            <div style={{ width: "44px" }} />{" "}
          </IonButtons>
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
                  <div className="info-card-angel">
                    <h3>{contact.Nome}</h3>
                    <p>{contact.Numero}</p>
                  </div>
                </div>
                <div className="buttons-card-angel">
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      openEditModal(contact);
                    }}
                  >
                    <IonIcon icon={pencilSharp} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedContactId(contact.documentId);
                      setSelectedContactName(contact.Nome);
                      setShowDeleteModal(true);
                    }}
                  >
                    <IonIcon icon={trash} />
                  </button>
                </div>
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

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleAddContact}
          title="Adicionar Contato do Anjo"
        >
          <input
            type="text"
            className="modal-input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
          />
          <input
            type="tel"
            className="modal-input"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número"
          />
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onConfirm={handleEditContact}
          title={`Editar Contato: ${selectedContactName}`}
        >
          <input
            type="text"
            className="modal-input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
          />
          <input
            type="tel"
            className="modal-input"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número"
          />
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteContact}
          title={`Você deseja excluir ${selectedContactName}?`}
        >
          <p>Tem certeza que deseja excluir este contato?</p>
        </Modal>

        {showToast && (
          <div className={`toast ${isHiding ? "hide" : ""}`}>
            Alteração realizada com sucesso!
          </div>
        )}
      </div>
    </IonPage>
  );
};

export default AngelContactPage;
