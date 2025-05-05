import React, { useEffect } from "react";
import {
  IonList,
  IonItem,
  IonLabel,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useHistory } from "react-router-dom";
import { useIonRouter } from "@ionic/react";

import "./AssistantChatList.css";

const AssistantChatList: React.FC = () => {
  const { chats, selectChat, generateRandomName, fetchChats } = useChat();
  const history = useHistory();
  const router = useIonRouter();

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/tab1" />
          </IonButtons>
          <IonTitle className="center-title">Chat</IonTitle>
          <IonButtons slot="end">
            <div style={{ width: "44px" }} />{" "}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <div className="chat-list-container">
        <div className="chat-list">
          {chats.length > 0 ? (
            chats.map((chat) => {
              const unreadCount = chat.mensagens.reduce((acc, msg) => {
                if (msg.Leitura === false) acc++;
                return acc;
              }, 0);

              console.log(unreadCount);
              return (
                <div
                  key={chat.id}
                  className="chat-item"
                  onClick={async () => {
                    await selectChat(chat.id);
                    router.push(`/assistantChats/${chat.id}`, "forward");
                  }}
                >
                  <div className="chat-info">
                    <h2 className="chat-name">
                      {generateRandomName(chat.usuario.id)}
                    </h2>
                    <p className="chat-message">
                      {chat.mensagens.length > 0
                        ? chat.mensagens[chat.mensagens.length - 1].Mensagem
                        : "Sem mensagens"}
                    </p>
                    {unreadCount > 0 && (
                      <span className="unread-count">
                        {unreadCount} Não lidas
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-chats">Nenhum chat ativo</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AssistantChatList;
