import { useRef } from "react";
import socket from "../Services/Socket";
import { Chat } from "../Types/chat.types";

/**
 * Interface para os parâmetros do hook useTyping
 */
type UseTypingParams = {
  activeChat: Chat | null;
};

/**
 * Hook para gerenciar o estado de "digitando" do chat
 * @param {UseTypingParams} params - Parâmetros do hook
 * @param {Chat | null} params.activeChat - Chat ativo selecionado
 * @returns {Object} Objeto com a função broadcastTyping
 * @returns {Function} broadcastTyping - Função para emitir o evento de "digitando" pelo socket
 */
export function useTyping({ activeChat }: UseTypingParams) {
  // Ref para armazenar o timeout do "parar de digitar"
  const typingTimeoutRef = useRef<any>();

  /**
   * Função para emitir o evento de "digitando" pelo socket
   * E também configura um timeout para emitir "parar de digitar" após 1 segundo de inatividade
   */
  const broadcastTyping = () => {
    if (activeChat) {
      // Emiti o evento de "digitando"
      socket.emit("typing", {
        ProtocoloID: activeChat.ProtocoloID,
        socketId: socket.id,
      });

      // Limpa o timeout anterior para evitar múltiplos eventos
      clearTimeout(typingTimeoutRef.current);
      
      // Configura novo timeout para emitir "parar de digitar" após 1 segundo
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          ProtocoloID: activeChat.ProtocoloID,
          socketId: socket.id,
        });
      }, 1000);
    }
  };

  return { broadcastTyping };
}
