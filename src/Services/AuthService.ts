import api from "./api";

interface UserPayload {
  id: number;
  username: string;
  email: string;
}

interface LoginPayload {
  jwt: string;
  user: UserPayload;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: number;
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
          identifier: identifier,
          password: password,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return null;
    }
  },

  async register(data: RegisterPayload): Promise<UserPayload | null> {
    try {
      const response = await api.post<UserPayload>("/users", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      return null;
    }
  },
};

export default AuthService;
