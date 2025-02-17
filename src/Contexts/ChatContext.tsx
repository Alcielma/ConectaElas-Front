import React, { createContext, useContext, useEffect, useState } from "react";
import ChatService from "../Services/ChatService";
import { useAuth } from "./AuthContext";

interface Message {
  id: number;
  Mensagem: string;
  Tipo_Remetente: string;
  Data_Envio: string;
  remetente: { id: number };
}

interface Chat {
  id: number;
  ProtocoloID: string;
  Status_Protocolo: string;
  mensagens: Message[];
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  fetchChats: () => void;
  startChat: (message: string) => Promise<Chat | null>;
  sendMessage: (chatId: number, message: string) => Promise<void>;
  selectChat: (chat: Chat) => void;
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
    console.log("Buscando...");
    const chatList = await ChatService.getChats();

    setChats(
      chatList.map((chat: Chat) => ({
        ...chat,
        mensagens: chat.mensagens || [],
      }))
    );
  };

  const startChat = async (message: string): Promise<Chat | null> => {
    if (!user) return null;

    let existingChat = chats.find((chat) =>
      chat.mensagens.some((msg) => msg.remetente.id === user.id)
    );

    if (existingChat) {
      console.log("Chat existente encontrado!", existingChat);
      setActiveChat(existingChat);
      return existingChat;
    }

    console.log("Criando novo chat...");
    const newChat = await ChatService.createChat();
    if (!newChat) return null;

    await ChatService.sendMessage(newChat.id, user.id, message);

    const chatComMensagens = { ...newChat, mensagens: [] };
    setChats((prev) => [...prev, chatComMensagens]);
    setActiveChat(chatComMensagens);
    return chatComMensagens;
  };

  const sendMessage = async (chatId: number, message: string) => {
    if (!user) return;

    const newMessage = await ChatService.sendMessage(chatId, user.id, message);

    if (!newMessage) {
      console.log("Erro ao enviar mensagem");
      return;
    }
    console.log("Mensagem enviada com sucesso:", newMessage);

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, mensagens: [...(chat.mensagens || []), newMessage] }
          : chat
      )
    );

    setActiveChat((prev) =>
      prev?.id === chatId
        ? { ...prev, mensagens: [...(prev.mensagens || []), newMessage] }
        : prev
    );

    console.log("Estado do activeChat atualizado!", activeChat);
  };

  const selectChat = (chat: Chat) => {
    if (!chat) {
      console.error("erro: chat inválido.");
      return;
    }

    setActiveChat(null);
    setTimeout(
      () => setActiveChat({ ...chat, mensagens: chat.mensagens || [] }),
      0
    );

    console.log("✅ Chat selecionado:", chat);
  };

  const colors = [
    "Azul",
    "Vermelho",
    "Verde",
    "Roxo",
    "Amarelo",
    "Laranja",
    "Rosa",
    "Preto",
  ];
  const animals = [
    "Tatu",
    "Coruja",
    "Gato",
    "Cachorro",
    "Panda",
    "Raposa",
    "Tigre",
    "Lobo",
  ];

  const generateRandomName = (userId: number) => {
    const color = colors[userId % colors.length];
    const animal = animals[userId % animals.length];
    return `${animal} ${color}`;
  };

  useEffect(() => {
    fetchChats();
  }, []);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
