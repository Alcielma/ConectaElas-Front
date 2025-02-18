import React, { createContext, useContext, useEffect, useState } from "react";
import ChatService from "../Services/ChatService";
import { useAuth } from "./AuthContext";
import api from "../Services/api";

interface Message {
  id: number;
  Mensagem: string;
  Data_Envio: string;
}

interface Chat {
  id: number;
  ProtocoloID: string;
  mensagens: Message[];
  usuario: { id: number };
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  fetchChats: () => void;
  startChat: (message: string) => Promise<Chat | null>;
  sendMessage: (chatId: number, message: string) => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  generateRandomName: (userId: number) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat deve ser usado dentro de um ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const fetchChats = async () => {
    if (!user) return;

    try {
      const response = await ChatService.getChats(user.id);
      const userChats = response || [];

      setChats(userChats);
    } catch (error) {
      setChats([]);
    }
  };

  const startChat = async (message: string): Promise<Chat | null> => {
    if (!user) return null;

    await fetchChats();

    let chat = chats.find((c) => c.usuario.id === user.id) ?? null;

    if (chat) {
      await selectChat(chat.id);
      return chat;
    }

    const newChat = await ChatService.createChat(user.id);
    if (!newChat) return null;

    await ChatService.sendMessage(newChat.id, message);

    chat = { ...newChat, mensagens: [] };

    if (chat) {
      setChats((prev) => [...prev, chat]);
      setActiveChat(chat);
    }

    return chat;
  };

  const sendMessage = async (chatId: number, message: string) => {
    if (!user) return;

    const newMessage = await ChatService.sendMessage(chatId, message);

    if (!newMessage) {
      return;
    }

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, mensagens: [...chat.mensagens, newMessage] }
          : chat
      )
    );

    setActiveChat((prev) =>
      prev?.id === chatId
        ? { ...prev, mensagens: [...prev.mensagens, newMessage] }
        : prev
    );
  };

  const selectChat = async (chatId: number) => {
    try {
      const response = await api.get(
        `/protocolos?filters[id][$eq]=${chatId}&populate[mensagens][fields]=Mensagem,Data_Envio`
      );

      if (!response.data || response.data.data.length === 0) {
        return;
      }

      const selectedChat = response.data.data[0];

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? { ...chat, mensagens: selectedChat.mensagens }
            : chat
        )
      );

      setActiveChat({
        id: selectedChat.id,
        ProtocoloID: selectedChat.ProtocoloID,
        mensagens: selectedChat.mensagens || [],
        usuario: selectedChat.usuario,
      });
    } catch (error) {}
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        fetchChats,
        startChat,
        sendMessage,
        selectChat,
        generateRandomName: (userId: number) => `User ${userId % 100}`,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
