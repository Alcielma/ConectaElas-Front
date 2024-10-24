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

      return response.data; // O 'data' contém diretamente o 'jwt' e 'user'
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return null;
    }
  },
};

export default AuthService;
