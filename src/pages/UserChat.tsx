import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonInput,
  IonButton,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useAuth } from "../Contexts/AuthContext";
import "./UserChat.css";

const UserChat: React.FC = () => {
  const { activeChat, startChat, sendMessage, selectChat } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (!activeChat) {
      console.log("Nenhum chat ativo. Buscando ou criando novo...");
      startChat("");
    } else {
      selectChat(activeChat.id);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    console.log("Enviando mensagem:", message);

    if (!activeChat) {
      console.log("Nenhum chat ativo. Criando novo...");
      await startChat(message);
    } else {
      console.log("Enviando para chat ID:", activeChat.id);
      await sendMessage(activeChat.id, message);
    }

    console.log("✅ Mensagem enviada!");
    setMessage("");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chat com Assistente</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="chat-content">
        <div className="messages-container">
          {activeChat?.mensagens?.length ? (
            activeChat.mensagens
              .sort(
                (a, b) =>
                  new Date(a.Data_Envio).getTime() -
                  new Date(b.Data_Envio).getTime()
              )
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    user?.id === activeChat?.usuario?.id ? "sent" : "received"
                  }`}
                >
                  <p>{msg.Mensagem}</p>
                  <span className="timestamp">
                    {new Date(msg.Data_Envio).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
          ) : (
            <p className="no-messages">Aguardando mensagens...</p>
          )}
          <div ref={chatEndRef} />
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="chat-input-toolbar">
          <IonInput
            value={message}
            placeholder="Digite sua mensagem..."
            onIonChange={(e) => setMessage(e.detail.value!)}
          />
          <IonButton onClick={handleSendMessage}>Enviar</IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default UserChat;
