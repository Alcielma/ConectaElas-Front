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
  documentId?: string;
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
  isSending: boolean;
  fetchChats: () => void;
  startChat: (message: string) => Promise<Chat | null>;
  sendMessage: (chatId: number, message: string) => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  fetchMessages: (chatId: number) => Promise<[]>;
  generateRandomName: (userId: number) => string;
  updateMessageStatus: (messageId: number, status: boolean) => Promise<void>;
  broadcastTyping: () => void;
  endProtocol: (chatId: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context) return context;
  return {
    chats: [],
    activeChat: null,
    isTyping: false,
    isSending: false,
    fetchChats: () => {},
    startChat: async () => null,
    sendMessage: async () => {},
    selectChat: async () => {},
    fetchMessages: async () => [],
    generateRandomName: () => "Usuário",
    updateMessageStatus: async () => {},
    broadcastTyping: () => {},
    endProtocol: async () => {},
  };
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [shouldResort, setShouldResort] = useState(true);
  let typingTimeout: any;
  const recentlySentRef = React.useRef<Record<number, { text: string; ts: number }[]>>({});

  const deduplicateChats = (chatsArray: Chat[]): Chat[] => {
    const seen = new Set<number>();
    return chatsArray.filter(chat => {
      if (seen.has(chat.id)) {
        return false;
      }
      seen.add(chat.id);
      return true;
    });
  };

  const fetchChats = async () => {
    if (!user) return;

    try {
      console.log(" Buscando chats do servidor...");
      const response = await ChatService.getChats(
        user.tipo === "Assistente" ? undefined : user.id,
        user.tipo === "Assistente"
      );
      let userChats = response || [];

      console.log("Chats recebidos do servidor:", userChats.length);

      // Sempre reordenar e atualizar todos os chats para garantir dados frescos
      userChats = userChats.sort((a: any, b: any) => {
        const getLastMessageDate = (chat: any) => {
          if (chat.mensagens && chat.mensagens.length > 0) {
            return new Date(chat.mensagens[chat.mensagens.length - 1].Data_Envio).getTime();
          }
          return new Date(chat.updatedAt || chat.createdAt).getTime();
        };
        return getLastMessageDate(b) - getLastMessageDate(a);
      });

      const uniqueChats = deduplicateChats(userChats);
      setChats(uniqueChats);
      
      if (activeChat) {
        const currentActiveChat = uniqueChats.find(c => c.id === activeChat.id);
        if (!currentActiveChat || currentActiveChat.Status_Finalizado === true) {
          setActiveChat(null);
        }
      }
      
      console.log("Chats atualizados no estado!");
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
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

    if (chat && chat.Status_Finalizado === false) {
      await selectChat(chat.id);
      if (message.trim()) {
        await sendMessage(chat.id, message);
      }
      return chat;
    }

    const newChat = await ChatService.createChat(user.id);
    if (!newChat) return null;

    chat = { ...newChat, mensagens: [] };
    
    if (chat) {
      setActiveChat((prev) => ({ ...newChat, mensagens: [] }));
      fetchChats();
    }

    if (message.trim()) {
      await sendMessage(newChat.id, message);
    }

    return chat;
  };

  const sendMessage = async (chatId: number, message: string) => {
    if (!user || isSending) return;
    
    const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setIsSending(true);
    
    try {
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

      // Salvar a mensagem no banco de dados primeiro
      const savedMessage = await ChatService.sendMessage(chatId, message, user.id, tempId);

      // Emitir a mensagem via socket para o outro usuário (incluindo tempId)
      socket.emit("send_message", { ProtocoloID, message, tempId, remetente: user.id });

      // Garantir que a mensagem tenha o remetente populado
      if (savedMessage) {
        // Se a API não retornou o remetente, adicionamos manualmente
        if (!savedMessage.remetente) {
          savedMessage.remetente = { id: user.id };
        } else if (typeof savedMessage.remetente === 'number') {
          savedMessage.remetente = { id: savedMessage.remetente };
        }
        updateChatMessages(chatId, savedMessage);
      } else {
        // Fallback: usar mensagem temporária se o salvamento falhar
        const newMessage = {
          id: Date.now(),
          tempId,
          Mensagem: message,
          Data_Envio: new Date().toISOString(),
          Leitura: false,
          remetente: { id: user.id },
        };
        updateChatMessages(chatId, newMessage);
      }

      const norm = message.trim().toLowerCase();
      const list = recentlySentRef.current[chatId] || [];
      const now = Date.now();
      const pruned = list.filter((i) => now - i.ts < 15000).slice(-20);
      recentlySentRef.current[chatId] = [...pruned, { text: norm, ts: now }];
    } finally {
      setIsSending(false);
    }
  };

  const selectChat = async (chatId: number) => {
    try {
      const response = await api.get(
        `/protocolos?filters[id][$eq]=${chatId}&fields[0]=Status_Finalizado&fields[1]=ProtocoloID&populate[usuario][fields][0]=id&populate[mensagens][fields][0]=id&populate[mensagens][fields][1]=Mensagem&populate[mensagens][fields][2]=Data_Envio&populate[mensagens][fields][3]=Leitura&populate[mensagens][populate][remetente][fields]=id,Tipo`
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
        Status_Finalizado: selectedChat.Status_Finalizado,
      }));

      setChats((prevChats) =>
        deduplicateChats(prevChats.map((chat) =>
          chat.id === chatId
            ? { ...chat, mensagens: selectedChat.mensagens, Status_Finalizado: selectedChat.Status_Finalizado, ProtocoloID: selectedChat.ProtocoloID }
            : chat
        ))
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
    setShouldResort(true);
    setChats((prevChats) => {
      let updatedChats = prevChats.map((chat) => {
        if (chat.id !== chatId) return chat;
        const existsById = chat.mensagens.some((m: any) => m.id === newMessage.id);
        const existsByTempId = newMessage.tempId && chat.mensagens.some((m: any) => m.tempId === newMessage.tempId);
        return existsById || existsByTempId
          ? chat
          : { ...chat, mensagens: [...chat.mensagens, newMessage] };
      });

      updatedChats = updatedChats.sort((a: any, b: any) => {
        const getLastMessageDate = (chat: any) => {
          if (chat.mensagens && chat.mensagens.length > 0) {
            return new Date(chat.mensagens[chat.mensagens.length - 1].Data_Envio).getTime();
          }
          return new Date(chat.updatedAt || chat.createdAt).getTime();
        };
        return getLastMessageDate(b) - getLastMessageDate(a);
      });

      return deduplicateChats(updatedChats);
    });

    setActiveChat((prev) => {
      if (!prev || prev.id !== chatId) return prev;
      const existsById = prev.mensagens.some((m: any) => m.id === newMessage.id);
      const existsByTempId = newMessage.tempId && prev.mensagens.some((m: any) => m.tempId === newMessage.tempId);
      return existsById || existsByTempId
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
    socket.off("typing");
    socket.off("stop_typing");

    socket.emit("authenticate", token);

    socket.once("authenticated", (response: any) => {
      if (response.success) {
        socket.emit("join_chat", activeChat.ProtocoloID);
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
    const storageKey = "userNames";
    
    let userNames: Record<number, string> = {};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        userNames = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Erro ao ler nomes do localStorage:", e);
    }

    if (userNames[userId]) {
      const existingName = userNames[userId];
      return existingName.split('#')[0];
    }

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

    const newName = `${randomAnimal} ${randomColor}`;
    
    userNames[userId] = newName;
    try {
      localStorage.setItem(storageKey, JSON.stringify(userNames));
    } catch (e) {
      console.error("Erro ao salvar nomes no localStorage:", e);
    }

    return newName;
  };

  const fetchMessages = async (chatId: number) => {
    if (!user) return;
    const messages = await ChatService.fetchMessages(chatId);
    if (messages.length === 0) return [];
    return messages;
  };

  const endProtocol = async (chatId: number) => {
    if (!user) return;
    console.log("🔴 Tentando excluir chat com ID:", chatId);
    // Encontra o chat para pegar o documentId
    const chatToDelete = chats.find((chat) => chat.id === chatId);
    console.log("🔴 Chat encontrado para exclusão:", chatToDelete);
    const idToUse = chatToDelete?.documentId || chatToDelete?.ProtocoloID || chatId;
    console.log("🔴 ID que será usado para DELETE:", idToUse);
    // Remove o chat localmente primeiro
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    const result = await ChatService.endProtocol(idToUse);
    console.log("🔴 Resultado da exclusão:", result);
    await fetchChats();
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

  // Listener global para receber mensagens em qualquer chat
  useEffect(() => {
    if (!user) return;

    console.log("🔌 Configurando listener global do socket...");
    console.log("🔌 Socket conectado:", socket.connected);

    const handleGlobalMessage = (msg: any) => {
      console.log("📩 ===== MENSAGEM RECEBIDA VIA SOCKET =====");
      console.log("📩 Dados completos da mensagem:", msg);
      console.log("📩 activeChat atual:", activeChat);
      
      // Verificar se a mensagem é do chat ativo
      if (activeChat) {
        console.log("📩 Verificando se é o chat ativo...");
        const isSameChat = 
          (msg.protocolo && msg.protocolo.id === activeChat.id) || 
          msg.ProtocoloID === activeChat.ProtocoloID;
          
        console.log("📩 É o mesmo chat?", isSameChat);
          
        if (isSameChat) {
          console.log("📩 Processando mensagem para o chat ativo...");
          
          const senderId =
            typeof (msg as any)?.remetente === "number"
              ? (msg as any).remetente
              : (msg as any)?.remetente?.id;
          
          console.log("📩 ID do remetente:", senderId);
          console.log("📩 ID do usuário atual:", user?.id);
          
          // Não adicionar a mensagem se for do próprio usuário
          if (senderId !== user?.id) {
            console.log("📩 Mensagem é de outro usuário, adicionando ao chat...");
            const list = recentlySentRef.current[activeChat.id] || [];
            const normIncoming = String((msg as any)?.Mensagem || "").trim().toLowerCase();
            const now = Date.now();
            const matchRecent = list.some((i) => i.text === normIncoming && now - i.ts < 5000);
            
            console.log("📩 É mensagem duplicada?", matchRecent);
            
            if (!matchRecent) {
              console.log("📩 Chamando updateChatMessages...");
              updateChatMessages(activeChat.id, msg);
              console.log("📩 updateChatMessages concluído!");
            }
          } else {
            console.log("📩 Mensagem é do próprio usuário, ignorando...");
          }
        }
      }
      
      // Sempre atualizamos a lista de chats para manter tudo sincronizado
      console.log("📩 Atualizando lista de chats...");
      fetchChats().then(() => {
        console.log("📩 Lista de chats atualizada!");
      });
      
      console.log("📩 ===== FIM PROCESSAMENTO MENSAGEM =====\n");
    };

    socket.on("receive_message", handleGlobalMessage);
    console.log("🔌 Listener 'receive_message' configurado!");

    // Listener para verificar conexão
    socket.on("connect", () => {
      console.log("🔌 Socket conectado com sucesso! ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket desconectado. Motivo:", reason);
    });

    return () => {
      console.log("🔌 Removendo listeners do socket...");
      socket.off("receive_message", handleGlobalMessage);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user, activeChat]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        isTyping,
        isSending,
        fetchChats,
        startChat,
        sendMessage,
        selectChat,
        generateRandomName,
        fetchMessages,
        updateMessageStatus,
        broadcastTyping,
        endProtocol,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
