import React, { useEffect, useState } from "react";
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
import { useParams } from "react-router-dom";

const AssistantChat: React.FC = () => {
  const [message, setMessage] = useState("");
  const { activeChat, sendMessage, selectChat } = useChat();
  const { chatId } = useParams<{ chatId: string }>();

  useEffect(() => {
    if (chatId) {
      selectChat(Number(chatId));
    }
  }, [chatId]);

  if (!activeChat) {
    return (
      <IonPage>
        <IonContent>
          <p>Carregando mensagens...</p>
        </IonContent>
      </IonPage>
    );
  }

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    sendMessage(activeChat.id, message);
    setMessage("");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chat</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {activeChat?.mensagens?.length > 0 ? (
          activeChat.mensagens.map((msg) => (
            <IonItem key={msg.id}>
              <IonLabel>{msg.Mensagem}</IonLabel>
            </IonItem>
          ))
        ) : (
          <p>Nenhuma mensagem ainda.</p>
        )}

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
