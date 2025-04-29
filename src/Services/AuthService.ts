import api from "./api";
import { IHTTPReturn } from "./apiTypes";

interface UserPayload {
  id: number;
  username: string;
  email: string;
  Tipo: string;
}

interface LoginPayload {
  jwt: string;
  user: UserPayload;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

const AuthService = {
  async login(
    identifier: string,
    password: string
  ): Promise<IHTTPReturn<LoginPayload>> {
    try {
      const response = await api.post<{ jwt: string; user: UserPayload }>(
        "/auth/local",
        {
          identifier,
          password,
        }
      );

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      return {
        success: false,
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Falha ao fazer login",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  async register(data: RegisterPayload): Promise<IHTTPReturn<LoginPayload>> {
    try {
      const response = await api.post<LoginPayload>(
        "/auth/local/register",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      console.log(error);
      return {
        success: false,
        status: error.response?.status,
        message: error.response?.data?.error?.message || "Falha ao registrar",
        error: error.response?.data?.error || error.message,
      };
    }
  },

  async updateEmail(userId: number, newEmail: string, authToken: string) {
    try {
      const response = await api.put(
        `/users/${userId}`,
        {
          email: newEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error("Erro ao atualizar o e-mail:", error);
      return false;
    }
  },

  async updateUsername(userId: number, newUsername: string, authToken: string) {
    try {
      const response = await api.put(
        `/users/${userId}`,
        {
          username: newUsername,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error("Erro ao atualizar o nome de usuário:", error);
      return false;
    }
  },
};

export default AuthService;
