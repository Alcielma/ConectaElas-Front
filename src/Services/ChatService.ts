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
      console.error("❌ Erro ao criar chat:", error);
      return null;
    }
  },

  async getChats(userId: number) {
    try {
      const response = await api.get(
        `/protocolos?fields[0]=ProtocoloID&fields[1]=id&populate[usuario][fields][0]=id&populate[mensagens][fields]=Mensagem,Data_Envio`
      );
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar chats:", error);
      return [];
    }
  },

  async sendMessage(chatId: number, message: string) {
    try {
      const response = await api.post("/mensagens", {
        data: {
          Mensagem: message,
          Data_Envio: new Date().toISOString(),
          protocolo: { id: chatId },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      return null;
    }
  },
};

export default ChatService;
