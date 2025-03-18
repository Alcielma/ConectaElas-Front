import api from "./api";

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
  ): Promise<LoginPayload | null> {
    try {
      const response = await api.post<{ jwt: string; user: UserPayload }>(
        "/auth/local",
        {
          identifier,
          password,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return null;
    }
  },

  async register(data: RegisterPayload): Promise<LoginPayload | null> {
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

      return response.data;
    } catch (error: any) {
      console.error(
        "Erro ao cadastrar usuário:",
        error.response?.data || error
      );
      return null;
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
