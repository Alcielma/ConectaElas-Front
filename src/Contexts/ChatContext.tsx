import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../Services/api";
import { Chat, ChatContextType } from "../Types/chat.types";
import { deduplicateChats } from "../utils/chatHelpers";
import { generateRandomName } from "../utils/randomNames";
import { useChats } from "../hooks/useChats";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";
import { useChatSocket } from "../hooks/useChatSocket";

/**
 * Contexto principal do chat, responsável por gerenciar todos os estados e funções relacionadas ao chat
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Hook personalizado para acessar o contexto do chat
 * @returns {ChatContextType} Objeto com todos os estados e funções do chat
 */
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
    selectChat: async () => null,
    fetchMessages: async () => [],
    generateRandomName: () => "Usuário",
    updateMessageStatus: async () => {},
    broadcastTyping: () => {},
    endProtocol: async () => {},
  };
};

/**
 * Provedor do contexto do chat
 * Orquestra todos os hooks e funções para disponibilizar no contexto
 * @param {React.ReactNode} children - Componentes filhos que terão acesso ao contexto
 */
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Hook para gerenciar a lista de chats
  const {
    chats,
    setChats,
    fetchChats,
    startChat,
    selectChat: selectChatFromHook,
    endProtocol,
  } = useChats({ user, setActiveChat, activeChat });

  // Hook para gerenciar as mensagens
  const {
    sendMessage,
    updateChatMessages,
    updateMessageStatus,
    fetchMessages,
    isSending,
  } = useMessages({
    user,
    activeChat,
    chats,
    selectChat: selectChatFromHook,
    setChats,
    setActiveChat,
    deduplicateChats,
    api,
  });

  // Hook para gerenciar o status de "digitando"
  const { broadcastTyping } = useTyping({ activeChat });

  // Hook para gerenciar a conexão socket
  useChatSocket({
    activeChat,
    user,
    updateChatMessages,
    fetchChats,
    setIsTyping,
  });

  /**
   * Função para selecionar e ativar um chat
   * Atualiza o chat ativo, a lista de chats e marca mensagens como lidas
   * @param {number} chatId - ID do chat a ser selecionado
   * @returns {Promise<Chat | null>} Chat selecionado ou null se não encontrado
   */
  const selectChat = async (chatId: number): Promise<Chat | null> => {
    const hydratedChat = await selectChatFromHook(chatId);
    if (hydratedChat) {
      setActiveChat(() => hydratedChat);
      setChats((prevChats) =>
        deduplicateChats(prevChats.map((chat) =>
          chat.id === chatId
            ? { ...chat, mensagens: hydratedChat.mensagens, Status_Finalizado: hydratedChat.Status_Finalizado, ProtocoloID: hydratedChat.ProtocoloID }
            : chat
        ))
      );

      for (const msg of hydratedChat.mensagens) {
        const senderId =
          typeof (msg as any).remetente === "number"
            ? (msg as any).remetente
            : (msg as any).remetente?.id;

        if (msg.Leitura === false && user && senderId !== user.id) {
          await updateMessageStatus(msg.documentId || msg.id, true);
        }
      }
    }
    return hydratedChat;
  };

  /**
   * Função para iniciar um novo chat com uma mensagem inicial (opcional)
   * @param {string} message - Mensagem inicial a ser enviada (opcional)
   * @returns {Promise<Chat | null>} Novo chat criado ou chat existente
   */
  const enhancedStartChat = async (message: string): Promise<Chat | null> => {
    const chat = await startChat(message);
    if (chat) {
      setActiveChat((prev) => ({ ...chat, mensagens: [] }));
      fetchChats();
      await selectChat(chat.id);
      if (message.trim()) {
        await sendMessage(chat.id, message);
      }
    }
    return chat;
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        isTyping,
        isSending,
        fetchChats,
        startChat: enhancedStartChat,
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
