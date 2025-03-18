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
  IonButtons,
  IonBackButton,
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
import Modal from "../components/Modal";
import "./AngelContact.css";

const AngelContactPage: React.FC = () => {
  const { authToken, user } = useAuth();
  const [contacts, setContacts] = useState<AngelContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [selectedContactName, setSelectedContactName] = useState<string | null>(
    null
  );
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="center-title">Contatos do anjo</IonTitle>
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
                  <div>
                    <h3>{contact.Nome}</h3>
                    <p>{contact.Numero}</p>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log(
                      `Abrindo modal para excluir: ${contact.Nome} (ID: ${contact.documentId})`
                    );
                    setSelectedContactId(contact.documentId);
                    setSelectedContactName(contact.Nome);
                    setShowDeleteModal(true);
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

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteContact}
          title={`Você deseja excluir ${selectedContactName}?`}
        >
          {/* <p>Tem certeza de que deseja excluir este contato?</p> */}
        </Modal>

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
