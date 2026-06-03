/**
 * Interface que representa uma mensagem de chat
 */
export interface Message {
  /** ID único da mensagem */
  id: number;
  documentId?: string;
  Mensagem: string;
  Data_Envio: string;
  Leitura: boolean;
  remetente?: { id: number };
}

/**
 * Interface que representa um chat (protocolo)
 */
export interface Chat {
  id: number;
  documentId?: string;
  ProtocoloID: string;
  mensagens: Message[];
  usuario: { id: number };
  Status_Finalizado?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

/**
 * Interface que define o tipo do contexto de chat
 * Contém todas as funções e estados disponíveis no ChatContext
 */
export interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isTyping: boolean;
  isSending: boolean;
  fetchChats: () => void;
  startChat: (message: string) => Promise<Chat | null>;
  sendMessage: (chatId: number, message: string) => Promise<void>;
  selectChat: (chatId: number) => Promise<Chat | null>;
  fetchMessages: (chatId: number) => Promise<[]>;
  generateRandomName: (userId: number) => string;
  updateMessageStatus: (messageId: number | string, status: boolean) => Promise<void>;
  broadcastTyping: () => void;
  endProtocol: (chatId: number) => Promise<void>;
}
