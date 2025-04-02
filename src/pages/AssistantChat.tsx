import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonInput,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useAuth } from "../Contexts/AuthContext";
import { IonIcon } from "@ionic/react";
import { send } from "ionicons/icons";
import "./UserChat.css";

const AssistantChat: React.FC = () => {
  const {
    activeChat,
    sendMessage,
    selectChat,
    fetchMessages,
    broadcastTyping,
    isTyping,
  } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<[]>([]);

  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");

    if (isTyping && messagesContainer) {
      messagesContainer.classList.add("typing");
    } else if (messagesContainer) {
      messagesContainer.classList.remove("typing");
    }
  }, [isTyping]);

  useEffect(() => {
    if (activeChat !== null) {
      const fetchMessageActiveChat = async () => {
        const fetchedMessages = await fetchMessages(activeChat.id);
        setMessages(fetchedMessages);
      };
      fetchMessageActiveChat();
    }
  }, [activeChat]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    if (activeChat !== null) {
      await sendMessage(activeChat.id, message);
    }
    setMessage("");
  };

  function handleMessageChange(message: string) {
    setMessage(message);
    broadcastTyping();
  }

  return (
    <IonPage className="Chat-root">
      <IonHeader className="Chat-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="center-title">Chat com Assistente</IonTitle>
          <IonButtons slot="end">
            <div style={{ width: "44px" }} />
          </IonButtons>
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
                    {new Date(msg.Data_Envio).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}{" "}
                    às{" "}
                    {new Date(msg.Data_Envio).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
          ) : (
            <p className="no-messages">
              Envie uma mensagem para iniciar seu chat com o assistente!
            </p>
          )}
          {isTyping && (
            <div className="message-bubble-typing received typing-visible">
              <p>Digitando...</p>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
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
              onIonChange={(e) => handleMessageChange(e.detail.value!)}
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
