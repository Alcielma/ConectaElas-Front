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
  fetchMessages: (chatId: number) => Promise<[]>;
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

    if (message != "")
      await ChatService.sendMessage(newChat.id, message, user.id);

    chat = { ...newChat, mensagens: [] };

    if (chat) {
      setChats((prev) => [...prev, chat]);
      setActiveChat(chat);
    }

    return chat;
  };

  const sendMessage = async (chatId: number, message: string) => {
    if (!user) return;

    const newMessage = await ChatService.sendMessage(chatId, message, user.id);

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
        `/protocolos?filters[id][$eq]=${chatId}&populate[mensagens][fields]=Mensagem,Data_Envio&populate[usuario][fields][0]=id`
      );

      if (!response.data || response.data.data.length === 0) {
        return;
      }

      const selectedChat = response.data.data[0];

      setActiveChat((prev) => ({
        id: selectedChat.id,
        ProtocoloID: selectedChat.ProtocoloID,
        mensagens: selectedChat.mensagens || [],
        usuario: selectedChat.usuario,
      }));

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? { ...chat, mensagens: selectedChat.mensagens }
            : chat
        )
      );
    } catch (error) {
      console.error("Erro ao buscar mensagens do chat:", error);
    }
  };

  const generateRandomName = (userId: number) => {
    const colors = [
      "Vermelho",
      "Azul",
      "Verde",
      "Amarelo",
      "Roxo",
      "Laranja",
      "Rosa",
      "Marrom",
      "Preto",
      "Branco",
      "Cinza",
      "Ciano",
      "Magenta",
      "Prateado",
      "Bronze",
    ];

    const animals = [
      "Leão",
      "Tigre",
      "Urso",
      "Lobo",
      "Águia",
      "Tubarão",
      "Pantera",
      "Falcão",
      "Raposa",
      "Gavião",
      "Coelho",
      "Tartaruga",
      "Guepardo",
      "Onça",
      "Pinguim",
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const numeroAleatorio = Math.floor(Math.random() * 1000);

    return `${randomAnimal} ${randomColor}#${numeroAleatorio}`;
  };

  const fetchMessages = async (chatId: number) => {
    if (!user) return;
    const messages = await ChatService.fetchMessages(chatId);
    console.log("daskdoask", messages);
    if (messages.length === 0) return [];
    return messages;
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    } else setActiveChat(null);
  }, [user]);

  console.log("chatAtivo", activeChat);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        fetchChats,
        startChat,
        sendMessage,
        selectChat,
        generateRandomName,
        fetchMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
