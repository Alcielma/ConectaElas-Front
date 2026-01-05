import React, { useEffect, useRef, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonContent,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useIonRouter } from "@ionic/react";
import { chevronDownCircleOutline } from "ionicons/icons";

import "./AssistantChatList.css";

const AssistantChatList: React.FC = () => {
  const { chats, selectChat, generateRandomName, fetchChats } = useChat();
  const router = useIonRouter();
  const [refreshing, setRefreshing] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Função para carregar os chats
  const loadChats = async () => {
    try {
      await fetchChats();
    } catch (error) {
      console.error("Erro ao carregar chats:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollToTop(300);
    }
  }, [chats]);

  // Função para lidar com o refresh manual
  const handleRefresh = async (event: CustomEvent) => {
    setRefreshing(true);
    await loadChats();
    event.detail.complete();
  };

  return (
    <>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="center-title">Chat</IonTitle>
          <IonButtons slot="end">
            <div style={{ width: "44px" }} />{" "}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef}>
        {/* Componente de pull-to-refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          />
        </IonRefresher>

        <div className="chat-list-container">
          {refreshing && (
            <div className="refreshing-indicator">Atualizando...</div>
          )}

          <div className="chat-list">
            {chats.length > 0 ? (
              chats.map((chat) => {
                const unreadCount = chat.mensagens.reduce((acc, msg) => {
                  if (msg.Leitura === false) acc++;
                  return acc;
                }, 0);

                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${unreadCount > 0 ? "unread" : ""}`}
                    onClick={async () => {
                      await selectChat(chat.id);
                      router.push(`/assistantChats/${chat.id}`, "forward");
                    }}
                  >
                    <div className="chat-info">
                      <h2 className="chat-name">
                        {generateRandomName(chat.usuario.id)}
                        {unreadCount > 0 && (
                          <span className="unread-count">{unreadCount}</span>
                        )}
                      </h2>
                      <p className="chat-message">
                        {chat.mensagens.length > 0
                          ? chat.mensagens[chat.mensagens.length - 1].Mensagem
                          : "Sem mensagens"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-chats">Nenhum chat ativo</p>
            )}
          </div>
        </div>
      </IonContent>
    </>
  );
};

export default AssistantChatList;
