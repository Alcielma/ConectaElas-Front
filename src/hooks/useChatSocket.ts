import { useEffect } from "react";
import socket from "../Services/Socket";
import { Chat, Message } from "../Types/chat.types";

/**
 * Interface para os parâmetros do hook useChatSocket
 */
type UseChatSocketParams = {
  activeChat: Chat | null;
  user: any;
  updateChatMessages: (chatId: number, newMessage: Message) => void;
  fetchChats: () => void;
  setIsTyping: (isTyping: boolean) => void;
};

/**
 * Hook para gerenciar a conexão socket.io do chat em tempo real
 * @param {UseChatSocketParams} params - Parâmetros do hook
 * @param {Chat | null} params.activeChat - Chat ativo selecionado
 * @param {any} params.user - Usuário autenticado
 * @param {Function} params.updateChatMessages - Função para atualizar as mensagens do chat
 * @param {Function} params.fetchChats - Função para buscar a lista de chats
 * @param {Function} params.setIsTyping - Função para atualizar o estado de "digitando"
 */
export function useChatSocket({
  activeChat,
  user,
  updateChatMessages,
  fetchChats,
  setIsTyping,
}: UseChatSocketParams) {
  /**
   * Effect para inicializar o socket e conectar ao chat ativo
   * É executado sempre que o chat ativo muda
   */
  useEffect(() => {
    // Conecta o socket se não estiver conectado
    if (!socket.connected) {
      socket.connect();
    }

    if (activeChat) {
      const token = localStorage.getItem("authToken");

      if (token) {
        // Limpa listeners anteriores para evitar duplicatas
        socket.off("authenticated");
        socket.off("typing");
        socket.off("stop_typing");

        // Autentica o socket com o token do usuário
        socket.emit("authenticate", token);

        // Quando a autenticação for bem-sucedida, entra na sala do chat
        socket.once("authenticated", (response: any) => {
          if (response.success) {
            socket.emit("join_chat", activeChat.ProtocoloID);
          }
        });

        // Listener para quando alguém estiver digitando
        socket.on("typing", () => {
          setIsTyping(true);
        });

        // Listener para quando alguém parar de digitar
        socket.on("stop_typing", () => {
          setIsTyping(false);
        });
      }
    }

    // Limpa listeners ao desmontar o componente ou mudar o chat ativo
    return () => {
      socket.off("authenticated");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [activeChat]);

  /**
   * Effect para receber mensagens globais do socket
   */
  useEffect(() => {
    if (!user) return;

    const handleGlobalMessage = (msg: any) => {
      // Se não há chat ativo, só atualiza a lista de chats
      if (!activeChat) {
        fetchChats();
        return;
      }

      const senderId =
        typeof msg?.remetente === "number" ? msg.remetente : msg?.remetente?.id;

      // Ignora mensagens enviadas pelo próprio usuário
      if (senderId === user?.id) {
        fetchChats();
        return;
      }

      // Verifica se a mensagem é do chat ativo
      const sameChat =
        (msg.protocolo && msg.protocolo.id === activeChat.id) ||
        msg.ProtocoloID === activeChat.ProtocoloID;

      if (sameChat) {
        updateChatMessages(activeChat.id, msg);
      }

      fetchChats();
    };

    socket.on("receive_message", handleGlobalMessage);

    // Limpa listener ao desmontar
    return () => {
      socket.off("receive_message", handleGlobalMessage);
    };
  }, [user, activeChat, updateChatMessages, fetchChats]);
}
