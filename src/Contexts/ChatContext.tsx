import React, { createContext, useContext, useEffect, useState } from "react";
import ChatService from "../Services/ChatService";
import { useAuth } from "./AuthContext";
import api from "../Services/api";
import socket from "../Services/Socket";

interface Message {
  id: number;
  Mensagem: string;
  Data_Envio: string;
  Leitura: boolean;
  remetente?: { id: number };
}

interface Chat {
  id: number;
  ProtocoloID: string;
  mensagens: Message[];
  usuario: { id: number };
  Status_Finalizado?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isTyping: boolean;
  fetchChats: () => void;
  startChat: (message: string) => Promise<Chat | null>;
  sendMessage: (chatId: number, message: string) => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  fetchMessages: (chatId: number) => Promise<[]>;
  generateRandomName: (userId: number) => string;
  updateMessageStatus: (messageId: number, status: boolean) => Promise<void>;
  broadcastTyping: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context) return context;
  return {
    chats: [],
    activeChat: null,
    isTyping: false,
    fetchChats: () => {},
    startChat: async () => null,
    sendMessage: async () => {},
    selectChat: async () => {},
    fetchMessages: async () => [],
    generateRandomName: () => "Usuário",
    updateMessageStatus: async () => {},
    broadcastTyping: () => {},
  };
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  let typingTimeout: any;
  const recentlySentRef = React.useRef<Record<number, { text: string; ts: number }[]>>({});

  const fetchChats = async () => {
    if (!user) return;

    try {
      const response = await ChatService.getChats(
        user.tipo === "Assistente" ? undefined : user.id,
        user.tipo === "Assistente"
      );
      const userChats = response || [];

      setChats(userChats);
    } catch (error) {
      setChats([]);
    }
  };

  const startChat = async (message: string): Promise<Chat | null> => {
    if (!user) return null;

    const existingChats = await ChatService.getChats(user.id, false);
    const openChats = (existingChats || []).filter(
      (c: any) => c.usuario?.id === user.id && c.Status_Finalizado === false
    );
    let chat = openChats.length
      ? openChats.sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0]
      : null;

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
      setActiveChat((prev) => ({ ...newChat, mensagens: [] }));
    }

    return chat;
  };

  const sendMessage = async (chatId: number, message: string) => {
    if (!user) return;
    let targetChat = activeChat;
    if (!targetChat) {
      const found = chats.find((c) => c.id === chatId) || null;
      if (!found) {
        await selectChat(chatId);
        targetChat = chats.find((c) => c.id === chatId) || null;
      } else {
        targetChat = found;
      }
      if (!targetChat) return;
    }
    const ProtocoloID = targetChat.ProtocoloID;

    socket.emit("send_message", { ProtocoloID, message });

    // Depois de emitir a mensagem, adicione-a ao estado local para que apareça imediatamente
    const newMessage = {
      id: Date.now(), // Gerar um ID temporário para a nova mensagem
      Mensagem: message,
      Data_Envio: new Date().toISOString(),
      Leitura: null, // A nova mensagem está inicialmente como não lida
      remetente: { id: user.id },
    };

    updateChatMessages(chatId, newMessage); // Atualiza a lista de mensagens do chat ativo

    const norm = message.trim().toLowerCase();
    const list = recentlySentRef.current[chatId] || [];
    const now = Date.now();
    const pruned = list.filter((i) => now - i.ts < 15000).slice(-20);
    recentlySentRef.current[chatId] = [...pruned, { text: norm, ts: now }];
  };

  const selectChat = async (chatId: number) => {
    try {
      const response = await api.get(
        `/protocolos?filters[id][$eq]=${chatId}&populate[usuario][fields][0]=id&populate[mensagens][fields][0]=id&populate[mensagens][fields][1]=Mensagem&populate[mensagens][fields][2]=Data_Envio&populate[mensagens][fields][3]=Leitura&populate[mensagens][populate][remetente][fields][0]=id`
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

      selectedChat.mensagens.forEach(async (msg: Message) => {
        const senderId =
          typeof (msg as any).remetente === "number"
            ? (msg as any).remetente
            : (msg as any).remetente?.id;

        if (msg.Leitura === false && user && senderId !== user.id) {
          await updateMessageStatus(msg.id, true);
        }
      });
    } catch (error) {
      console.error("Erro ao buscar mensagens do chat:", error);
    }
  };

  function updateChatMessages(chatId: number, newMessage: any) {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== chatId) return chat;
        const existsById = chat.mensagens.some((m: any) => m.id === newMessage.id);
        return existsById
          ? chat
          : { ...chat, mensagens: [...chat.mensagens, newMessage] };
      })
    );

    setActiveChat((prev) => {
      if (!prev || prev.id !== chatId) return prev;
      const existsById = prev.mensagens.some((m: any) => m.id === newMessage.id);
      return existsById
        ? prev
        : { ...prev, mensagens: [...prev.mensagens, newMessage] };
    });
  }

  const updateMessageStatus = async (messageId: number, status: boolean) => {
    try {
      if (typeof messageId !== "number" || !Number.isFinite(messageId) || messageId <= 0) {
        return;
      }
      const response = await api.put(`/mensagens/${messageId}`, {
        data: { Leitura: status },
      });

      if (response.status === 200) {
        console.log(`Mensagem com ID ${messageId} marcada como lida`);
      } else {
        console.error("Erro ao atualizar o status da mensagem");
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn(`Mensagem ${messageId} não encontrada para atualização de leitura (404). Ignorando.`);
        return;
      }
      console.error("Erro ao atualizar o status da mensagem:", error);
    }
  };

  function initializeSocket() {
    if (!socket.connected) {
      console.warn("Socket não conectado. Tentando reconectar...");
      socket.connect();
    }

    console.log("Socket conectado");

    if (!activeChat) {
      console.log(activeChat);
      console.error("ERROR - ACTIVE CHAT NÃO EXISTE");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("Token de autenticação não encontrado!");
      return;
    }

    socket.off("authenticated");
    socket.off("receive_message");
    socket.off("typing");
    socket.off("stop_typing");

    socket.emit("authenticate", token);

    socket.once("authenticated", (response: any) => {
      if (response.success) {
        socket.emit("join_chat", activeChat.ProtocoloID);

        socket.on("receive_message", (msg: Message) => {
          const senderId =
            typeof (msg as any)?.remetente === "number"
              ? (msg as any).remetente
              : (msg as any)?.remetente?.id;
          if (senderId === user?.id) {
            return;
          }
          const list = recentlySentRef.current[activeChat.id] || [];
          const normIncoming = String((msg as any)?.Mensagem || "").trim().toLowerCase();
          const now = Date.now();
          const matchRecent = list.some((i) => i.text === normIncoming && now - i.ts < 5000);
          if (matchRecent) {
            return;
          }
          updateChatMessages(activeChat.id, msg);
        });
        return;
      }

      if (response.error) {
        console.error("Falha ao autenticar socket:", response.error.message);
        return;
      }
    });

    socket.on("typing", () => {
      setIsTyping(true);
    });

    socket.on("stop_typing", () => {
      setIsTyping(false);
    });
  }

  const broadcastTyping = () => {
    if (activeChat) {
      socket.emit("typing", {
        ProtocoloID: activeChat.ProtocoloID,
        socketId: socket.id, // Inclui o socketId do usuário
      });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("stop_typing", {
          ProtocoloID: activeChat.ProtocoloID,
          socketId: socket.id, // Inclui o socketId do usuário
        });
      }, 1000);
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
    if (messages.length === 0) return [];
    return messages;
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    } else setActiveChat(null);
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      initializeSocket();
    }
  }, [activeChat]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        isTyping,
        fetchChats,
        startChat,
        sendMessage,
        selectChat,
        generateRandomName,
        fetchMessages,
        updateMessageStatus,
        broadcastTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
