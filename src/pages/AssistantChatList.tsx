import React, { useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useChat } from "../Contexts/ChatContext";
import { useHistory } from "react-router-dom";

const AssistantChatList: React.FC = () => {
  const { chats, selectChat, generateRandomName, fetchChats } = useChat();
  const history = useHistory();

  useEffect(() => {
    fetchChats();
  }, []);

  console.log("🔹 AssistantChatList carregado!");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lista de Chats Ativos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <IonItem
                key={chat.id}
                button
                onClick={() => {
                  selectChat(chat);
                  history.push(`/tabs/chat/${chat.id}`);
                }}
              >
                <IonLabel>
                  <h2>{generateRandomName(chat.id)}</h2>
                  <p>
                    {chat.mensagens.length > 0
                      ? chat.mensagens[chat.mensagens.length - 1].Mensagem
                      : "Sem mensagens"}
                  </p>
                </IonLabel>
              </IonItem>
            ))
          ) : (
            <p>Nenhum chat ativo</p>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AssistantChatList;
