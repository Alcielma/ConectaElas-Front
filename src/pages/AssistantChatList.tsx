import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonContent,
  IonButton,
  IonIcon,
  useIonRouter,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useAuth } from "../Contexts/AuthContext";
import { chevronDownCircleOutline, chevronForward } from "ionicons/icons";

import "./AssistantChatList.css";

const AssistantChatList: React.FC = () => {
  const { chats, selectChat, generateRandomName, fetchChats, endProtocol } = useChat();
  const { user } = useAuth();
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

  // Polling periódico para atualizar a lista de chats
  useEffect(() => {
    // Polling a cada 1 segundo para atualizar a lista
    const intervalId = setInterval(async () => {
      try {
        await fetchChats();
      } catch (error) {
        console.error("Erro no polling (Lista de Chats):", error);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fetchChats]);

  // Função para lidar com o refresh manual
  const handleRefresh = async (event: CustomEvent) => {
    setRefreshing(true);

    await loadChats();

    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-gradient">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>

          <IonTitle className="center-title">
            Chat
          </IonTitle>

          <IonButtons slot="end">
            <div style={{ width: "44px" }} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef}>
        {/* Pull To Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          />
        </IonRefresher>

        <div className="chat-list-container">
          {refreshing && (
            <div className="refreshing-indicator">
              Atualizando...
            </div>
          )}

          <div className="chat-list">
            {chats.length > 0 ? (
              chats.map((chat) => {
                // Ordena mensagens da mais recente para a mais antiga
                const sortedMessages = [...chat.mensagens].sort(
                  (a: any, b: any) =>
                    new Date(b.Data_Envio).getTime() -
                    new Date(a.Data_Envio).getTime()
                );

                // Última mensagem
                const lastMessage = sortedMessages[0];

                // Verifica se o remetente é do tipo "Usuário"
                const isSenderUser = (sender: any) => {
                  if (typeof sender === "object" && sender !== null) {
                    return sender.Tipo === "Usuário";
                  }
                  return false;
                };

                // Verifica se existe alguma mensagem do usuário não lida (para barra lateral)
                const hasUnreadUserMessages = chat.mensagens.some((msg: any) => {
                  return isSenderUser(msg.remetente) && msg.Leitura === false;
                });

                // Conta mensagens não lidas do usuário para a badge
                const unreadCount = chat.mensagens.filter((msg: any) => {
                  return isSenderUser(msg.remetente) && msg.Leitura === false;
                }).length;

                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${hasUnreadUserMessages ? "unread" : ""}`}
                  >
                    <div 
                      className="chat-info"
                      onClick={async () => {
                        await selectChat(chat.id);

                        router.push(
                          `/assistantChats/${chat.id}`,
                          "forward"
                        );
                      }}
                    >
                      <div className="chat-name-row">
                        <h2 className="chat-name">
                          {generateRandomName(chat.usuario.id)}
                        </h2>
                        {unreadCount > 0 && (
                          <span className="unread-badge">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="chat-message-row">
                        <p className="chat-message">
                          {lastMessage
                            ? lastMessage.Mensagem
                            : "Sem mensagens"}
                        </p>
                        <IonIcon 
                          icon={chevronForward} 
                          className="chat-arrow"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no-chats">
                Nenhum chat ativo
              </p>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AssistantChatList;