import React, { createContext, useState, useContext, ReactNode } from "react";
import AuthService from "../Services/AuthService";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserPayload {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale?: string;
}

interface AuthContextType {
  authToken: string | null;
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState<User | null>(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  });

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await AuthService.login(identifier, password);
      if (result) {
        const { jwt: token, user: userPayload } = result;

        // Adaptando UserPayload para User, mapeando 'username' para 'name'
        const adaptedUser: User = {
          id: userPayload.id,
          name: userPayload.username, // Mapeando 'username' para 'name'
          email: userPayload.email,
        };

        setAuthToken(token);
        setUser(adaptedUser);
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(adaptedUser));
        return true; // Login bem-sucedido
      } else {
        return false; // Credenciais inválidas
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false; // Login falhou
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
