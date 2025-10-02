import api from "./api";

export interface AngelContact {
  id: number;
  documentId: string;
  Nome: string;
  Numero: string;
}

const AngelContactService = {
  async fetchContacts(
    authToken: string,
    userId: number
  ): Promise<AngelContact[]> {
    try {
      const response = await api.get(
        `/contato-do-anjos?populate=*&filters[usuario][id][$eq]=${userId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      return response.data.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        Nome: item.Nome,
        Numero: item.Numero,
      }));
    } catch (error) {
      console.error("Erro ao buscar contatos do anjo:", error);
      return [];
    }
  },
  async addContact(
    authToken: string,
    nome: string,
    numero: string,
    userId: number
  ): Promise<boolean> {
    try {
      await api.post(
        "/contato-do-anjos",
        {
          data: {
            Nome: nome,
            Numero: numero,
            usuario: {
              id: userId,
            },
          },
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      return true;
    } catch (error) {
      console.error("Erro ao adicionar contato do anjo:", error);
      return false;
    }
  },

  async updateContact(
    authToken: string,
    documentId: string,
    nome: string,
    numero: string,
    userId: number
  ): Promise<boolean> {
    try {
      await api.put(
        `/contato-do-anjos/${documentId}`,
        {
          data: {
            Nome: nome,
            Numero: numero,
            usuario: {
              id: userId,
            },
          },
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      return true;
    } catch (error) {
      console.error("Erro ao atualizar o contato do anjo:", error);
      return false;
    }
  },

  async deleteContact(authToken: string, documentId: string): Promise<boolean> {
    try {
      await api.delete(`/contato-do-anjos/${documentId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default AngelContactService;
