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
import { IonIcon } from "@ionic/react";
import { send } from "ionicons/icons";

const UserChat: React.FC = () => {
  const { activeChat, startChat, sendMessage, selectChat, fetchMessages } =
    useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("executou o useffect");
    if (!activeChat) {
      console.log("Nenhum chat ativo. Buscando ou criando novo...");
      startChat("");
    } else {
      console.log("activechat.id", activeChat.id);
      selectChat(activeChat.id);
    }
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    const fetchMessageActiveChat = async () => {
      const messages = await fetchMessages(activeChat.id);
      setMessages(messages);
    };

    const intervalId = setInterval(fetchMessageActiveChat, 5000);

    fetchMessageActiveChat();

    return () => clearInterval(intervalId);
  }, [activeChat]);

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
          {messages.length ? (
            messages
              .sort(
                (a: any, b: any) =>
                  new Date(a.Data_Envio).getTime() -
                  new Date(b.Data_Envio).getTime()
              )
              .map((msg: any) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    user?.id === msg.remetente.id ? "sent" : "received"
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
            <p className="no-messages">
              {" "}
              Envie uma mensagem para iniciar seu chat com um dos nossos
              assistentes!
            </p>
          )}
          <div ref={chatEndRef} />
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="chat-input-toolbar">
          <div style={{ display: "flex", alignItems: "center" }}>
            <IonInput
              value={message}
              placeholder="Digite sua mensagem..."
              onIonChange={(e) => setMessage(e.detail.value!)}
              style={{ flex: 1 }}
            />
            <IonIcon
              icon={send}
              size="large"
              style={{ cursor: "pointer", color: "white", marginLeft: "8px" }}
              onClick={handleSendMessage}
            />
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default UserChat;
