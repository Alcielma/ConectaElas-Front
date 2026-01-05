import api from "./api";

const ChatService = {
  async createChat(userId: number) {
    try {
      const response = await api.post("/protocolos", {
        data: {
          Data_Abertura: new Date().toISOString(),
          usuario: { id: userId },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Erro ao criar chat:", error);
      return null;
    }
  },

  async getChats(userId?: number, isAssistant?: boolean) {
    try {
      const base =
        `/protocolos?fields[0]=ProtocoloID&fields[1]=id&fields[2]=Status_Finalizado&fields[3]=updatedAt&fields[4]=createdAt&populate[usuario][fields][0]=id&populate[mensagens][fields]=Mensagem,Data_Envio,Leitura&sort=updatedAt:desc`;

      const query =
        isAssistant
          ? `${base}&filters[Status_Finalizado][$eq]=false`
          : `${base}&filters[usuario][id][$eq]=${userId}&filters[Status_Finalizado][$eq]=false`;

      const response = await api.get(query);
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
      return [];
    }
  },

  async sendMessage(chatId: number, message: string, userId: number) {
    try {
      const response = await api.post("/mensagens", {
        data: {
          Mensagem: message,
          Data_Envio: new Date().toISOString(),
          protocolo: { id: chatId },
          remetente: { id: userId },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      return null;
    }
  },

  async fetchMessages(chatId: number) {
    try {
      const response = await api.get(
        `/mensagens/?filters[protocolo][id][$eq]=${chatId}&populate=*`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }
  },
};

export default ChatService;
