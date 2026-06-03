import { useRef, useState } from "react";
import ChatService from "../Services/ChatService";
import socket from "../Services/Socket";
import { Chat, Message } from "../Types/chat.types";

/**
 * Interface para os parâmetros do hook useMessages
 */
type UseMessagesParams = {
  user: any;
  activeChat: Chat | null;
  chats: Chat[];
  selectChat: (chatId: number) => Promise<Chat | null>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  deduplicateChats: (chats: Chat[]) => Chat[];
  api: any;
};

/**
 * Hook para gerenciar as mensagens do chat
 * @param {UseMessagesParams} params - Parâmetros do hook
 * @param {any} params.user - Usuário autenticado
 * @param {Chat | null} params.activeChat - Chat ativo selecionado
 * @param {Chat[]} params.chats - Lista de chats do usuário
 * @param {Function} params.selectChat - Função para buscar um chat pelo ID
 * @param {Function} params.setChats - Função para atualizar o estado da lista de chats
 * @param {Function} params.setActiveChat - Função para atualizar o chat ativo
 * @param {Function} params.deduplicateChats - Função para remover chats duplicados
 * @param {any} params.api - Instância da API
 * @returns {Object} Objeto com as funções e estado do hook
 * @returns {Function} sendMessage - Função para enviar mensagens
 * @returns {Function} updateChatMessages - Função para atualizar as mensagens de um chat
 * @returns {Function} updateMessageStatus - Função para atualizar o status de leitura de uma mensagem
 * @returns {Function} fetchMessages - Função para buscar as mensagens de um chat
 * @returns {boolean} isSending - Estado que indica se uma mensagem está sendo enviada
 */
export function useMessages({
  user,
  activeChat,
  chats,
  selectChat,
  setChats,
  setActiveChat,
  deduplicateChats,
  api,
}: UseMessagesParams) {
  // Estado que indica se uma mensagem está sendo enviada
  const [isSending, setIsSending] = useState(false);
  // Ref para armazenar mensagens enviadas recentemente (para evitar duplicatas)
  const recentlySentRef = useRef<Record<number, { text: string; ts: number }[]>>({});

  /**
   * Função para atualizar as mensagens de um chat
   * Adiciona uma nova mensagem ao chat se ela não existir
   */
  const updateChatMessages = (chatId: number, newMessage: Message) => {
    // Atualiza a lista de chats
    setChats((prevChats) => {
      const updated = prevChats.map((chat) => {
        if (chat.id !== chatId) return chat;
        // Verifica se a mensagem já existe para não adicionar duplicatas
        const exists = chat.mensagens.some((m) => m.id === newMessage.id);
        if (exists) return chat;
        return { ...chat, mensagens: [...chat.mensagens, newMessage] };
      });
      return deduplicateChats(updated);
    });

    // Atualiza o chat ativo
    setActiveChat((prev) => {
      if (!prev || prev.id !== chatId) return prev;
      const exists = prev.mensagens.some((m) => m.id === newMessage.id);
      if (exists) return prev;
      return { ...prev, mensagens: [...prev.mensagens, newMessage] };
    });
  };

  /**
   * Função para enviar uma nova mensagem
   * @param {number} chatId - ID do chat
   * @param {string} message - Texto da mensagem
   */
  const sendMessage = async (chatId: number, message: string) => {
    if (!user || isSending) return;
    setIsSending(true);

    try {
      // Encontra o chat alvo
      let targetChat =
        activeChat && activeChat.id === chatId ? activeChat : null;

      if (!targetChat) {
        targetChat = chats.find((c) => c.id === chatId) || null;
      }

      if (!targetChat) {
        targetChat = await selectChat(chatId);
      }

      if (!targetChat) return;

      const ProtocoloID = targetChat.ProtocoloID;
      // Salva a mensagem via API REST
      const savedMessage = await ChatService.sendMessage(chatId, message, user.id);

      if (!savedMessage) return;

      // Garante que a mensagem tenha o remetente formatado corretamente
      if (!savedMessage.remetente) {
        savedMessage.remetente = { id: user.id };
      } else if (typeof savedMessage.remetente === "number") {
        savedMessage.remetente = { id: savedMessage.remetente };
      }

      // Atualiza a mensagem localmente
      updateChatMessages(chatId, savedMessage);

      // Emiti o evento pelo socket para notificar o outro usuário
      socket.emit("send_message", {
        ProtocoloID,
        messageId: savedMessage.id,
        remetente: user.id,
      });

      // Armazena a mensagem enviada recentemente para evitar duplicatas
      const norm = message.trim().toLowerCase();
      const list = recentlySentRef.current[chatId] || [];
      const now = Date.now();

      recentlySentRef.current[chatId] = [
        ...list.filter((i) => now - i.ts < 15000), // Mantém apenas mensagens dos últimos 15 segundos
        { text: norm, ts: now },
      ];
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Função para atualizar o status de leitura de uma mensagem
   * @param {number | string} messageId - ID da mensagem
   * @param {boolean} status - Status de leitura (true = lida)
   */
  const updateMessageStatus = async (
    messageId: number | string,
    status: boolean
  ) => {
    try {
      if (!messageId) return;
      await api.put(`/mensagens/${messageId}`, {
        data: { Leitura: status },
      });
    } catch (error) {
      console.error("Erro ao atualizar mensagem:", messageId, error);
    }
  };

  /**
   * Função para buscar as mensagens de um chat
   * @param {number} chatId - ID do chat
   * @returns {Promise<Array>} Lista de mensagens do chat
   */
  const fetchMessages = async (chatId: number) => {
    if (!user) return;
    const messages = await ChatService.fetchMessages(chatId);
    if (messages.length === 0) return [];
    return messages;
  };

  return {
    sendMessage,
    updateChatMessages,
    updateMessageStatus,
    fetchMessages,
    isSending,
  };
}
