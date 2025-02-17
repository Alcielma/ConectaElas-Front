import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useAuth } from "../Contexts/AuthContext";

const AssistantChat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = React.useState("");
  const { activeChat, sendMessage, generateRandomName } = useChat();

  if (!activeChat) {
    return (
      <IonPage>
        <IonContent>
          <p>Selecione um chat para visualizar as mensagens.</p>
        </IonContent>
      </IonPage>
    );
  }

  const handleSendMessage = () => {
    if (message.trim() && activeChat) {
      sendMessage(activeChat.id, message);
      setMessage("");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chat com {generateRandomName(activeChat.id)}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="messages-container">
          {activeChat?.mensagens?.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${
                msg.remetente?.id === user?.id ? "sent" : "received"
              }`}
            >
              <strong>
                {msg.remetente?.id !== user?.id
                  ? generateRandomName(msg.remetente?.id)
                  : "Você"}
              </strong>

              <p>{msg.Mensagem}</p>
              <span className="timestamp">
                {new Date(msg.Data_Envio).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>

        <IonItem>
          <IonInput
            value={message}
            onIonChange={(e) => setMessage(e.detail.value!)}
            placeholder="Digite uma mensagem..."
          />
          <IonButton onClick={handleSendMessage}>Enviar</IonButton>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default AssistantChat;
