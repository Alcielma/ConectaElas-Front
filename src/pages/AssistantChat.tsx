import React, { useEffect, useRef, useState } from "react";
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
  IonFooter,
  IonList,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useHistory, useParams } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { IonIcon } from "@ionic/react";
import { send } from "ionicons/icons";

const AssistantChat: React.FC = () => {
  const [message, setMessage] = useState("");
  const { activeChat, sendMessage, selectChat, fetchMessages } = useChat();
  const [messages, setMessages] = useState<[]>([]);
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const history = useHistory();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (chatId) {
      selectChat(Number(chatId));
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

export default AssistantChat;
