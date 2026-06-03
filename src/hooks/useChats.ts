import { useState, useEffect } from "react";
import ChatService from "../Services/ChatService";
import { Chat } from "../Types/chat.types";
import { deduplicateChats } from "../utils/chatHelpers";
import api from "../Services/api";

/**
 * Interface para os parâmetros do hook useChats
 */
type UseChatsParams = {
  user: any;
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  activeChat: Chat | null;
};

/**
 * Hook para gerenciar a lista de chats do usuário
 * @param {UseChatsParams} params - Parâmetros do hook
 * @param {any} params.user - Usuário autenticado
 * @param {Function} params.setActiveChat - Função para atualizar o chat ativo
 * @param {Chat | null} params.activeChat - Chat ativo selecionado
 * @returns {Object} Objeto com as funções e estado do hook
 * @returns {Chat[]} chats - Lista de chats do usuário
 * @returns {Function} setChats - Função para atualizar o estado da lista de chats
 * @returns {Function} fetchChats - Função para buscar os chats do usuário
 * @returns {Function} startChat - Função para iniciar um novo chat
 * @returns {Function} selectChat - Função para buscar um chat pelo ID
 * @returns {Function} endProtocol - Função para finalizar um chat
 */
export function useChats({ user, setActiveChat, activeChat }: UseChatsParams) {
  const [chats, setChats] = useState<Chat[]>([]);

  /**
   * Função para buscar os chats do usuário
   * Ordena os chats por data da última mensagem ou data de criação
   * Remove chats duplicados
   */
  const fetchChats = async () => {
    if (!user) return;
    try {
      // Busca os chats via API
      const response = await ChatService.getChats(
        user.tipo === "Assistente" ? undefined : user.id,
        user.tipo === "Assistente"
      );
      let userChats = response || [];
      // Ordena os chats por data da última mensagem (mais recente primeiro)
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
      
      // Verifica se o chat ativo ainda existe e não está finalizado
      if (activeChat) {
        const currentActiveChat = uniqueChats.find(c => c.id === activeChat.id);
        if (!currentActiveChat || currentActiveChat.Status_Finalizado === true) {
          setActiveChat(null);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
      setChats([]);
    }
  };

  /**
   * Função para iniciar um novo chat
   * Primeiro verifica se há um chat aberto existente, se não, cria um novo
   * @param {string} message - Mensagem inicial do chat (opcional)
   * @returns {Promise<Chat | null>} Novo chat criado ou chat aberto existente
   */
  const startChat = async (message: string): Promise<Chat | null> => {
    if (!user) return null;
    // Busca chats existentes
    const existingChats = await ChatService.getChats(user.id, false);
    // Filtra apenas chats não finalizados do usuário
    const openChats = (existingChats || []).filter(
      (c: any) => c.usuario?.id === user.id && c.Status_Finalizado === false
    );
    let chat = openChats.length
      ? openChats.sort(
          (a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0]
      : null;
    // Se há um chat aberto existente, retorna ele
    if (chat && chat.Status_Finalizado === false) {
      return chat;
    }
    // Cria um novo chat
    const newChat = await ChatService.createChat(user.id);
    if (!newChat) return null;
    chat = { ...newChat, mensagens: [] };
    return chat;
  };

  /**
   * Função para buscar um chat pelo ID
   * Retorna o chat com mensagens populadas
   * @param {number} chatId - ID do chat
   * @returns {Promise<Chat | null>} Chat encontrado ou null
   */
  const selectChat = async (chatId: number): Promise<Chat | null> => {
    try {
      const response = await api.get(
        `/protocolos?filters[id][$eq]=${chatId}&fields[0]=Status_Finalizado&fields[1]=ProtocoloID&fields[2]=documentId&populate[usuario][fields][0]=id&populate[mensagens][fields][0]=id&populate[mensagens][fields][1]=documentId&populate[mensagens][fields][2]=Mensagem&populate[mensagens][fields][3]=Data_Envio&populate[mensagens][fields][4]=Leitura&populate[mensagens][populate][remetente][fields]=id,Tipo`
      );
      // Se o chat não existir, remove ele da lista e desativa o chat ativo
      if (!response.data || response.data.data.length === 0) {
        setActiveChat((prev) => (prev?.id === chatId ? null : prev));
        setChats((prevChats) => prevChats.filter((c) => c.id !== chatId));
        return null;
      }
      const selectedChat = response.data.data[0];
      // Se o chat estiver finalizado, remove ele da lista
      if (selectedChat.Status_Finalizado === true) {
        setActiveChat((prev) => (prev?.id === chatId ? null : prev));
        setChats((prevChats) => prevChats.filter((c) => c.id !== chatId));
        return null;
      }
      const hydratedChat: Chat = {
        id: selectedChat.id,
        documentId: selectedChat.documentId,
        ProtocoloID: selectedChat.ProtocoloID,
        mensagens: selectedChat.mensagens || [],
        usuario: selectedChat.usuario,
        Status_Finalizado: selectedChat.Status_Finalizado,
      };
      return hydratedChat;
    } catch (error) {
      console.error("Erro ao buscar mensagens do chat:", error);
      return null;
    }
  };

  /**
   * Função para finalizar um chat
   * @param {number} chatId - ID do chat
   */
  const endProtocol = async (chatId: number) => {
    if (!user) return;
    const chatToDelete = chats.find((chat) => chat.id === chatId);
    const idToUse = chatToDelete?.documentId || chatToDelete?.ProtocoloID || chatId;
    // Remove o chat da lista localmente primeiro
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    setActiveChat((prev) => (prev?.id === chatId ? null : prev));
    // Finaliza o chat via API
    await ChatService.endProtocol(idToUse);
    // Atualiza a lista de chats
    await fetchChats();
  };

  /**
   * Effect para buscar os chats quando o usuário muda
   */
  useEffect(() => {
    if (user) {
      fetchChats();
    } else {
      setActiveChat(null);
    }
  }, [user]);

  return {
    chats,
    setChats,
    fetchChats,
    startChat,
    selectChat,
    endProtocol,
  };
}