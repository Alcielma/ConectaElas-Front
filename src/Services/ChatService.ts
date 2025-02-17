import api from "./api";

const ChatService = {
  async createChat() {
    try {
      const response = await api.post("/protocolos", {
        data: {
          Data_Abertura: new Date().toISOString(),
        },
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao criar protocolo:", error.response?.data || error);
      return null;
    }
  },

  async getChats() {
    try {
      const response = await api.get("/protocolos/?populate=*");
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar chats:", error);
      return [];
    }
  },

  async sendMessage(chatId: number, userId: number, message: string) {
    try {
      const response = await api.post("/mensagens", {
        data: {
          Mensagem: message,
          Tipo_Remetente: "Usuario",
          Data_Envio: new Date().toISOString(),
          remetente: { id: userId },
          protocolo: { id: chatId },
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error.response?.data || error);
      return null;
    }
  },
};

export default ChatService;
