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

import "./AssistantChatList.css";

const AssistantChatList: React.FC = () => {
  const { chats, selectChat, generateRandomName, fetchChats } = useChat();
  const history = useHistory();

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
            chats.map((chat) => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={async () => {
                  await selectChat(chat.id);
                  history.push(`/assistantChats/${chat.id}`);
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
                </div>
              </div>
            ))
          ) : (
            <p className="no-chats">Nenhum chat ativo</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AssistantChatList;
