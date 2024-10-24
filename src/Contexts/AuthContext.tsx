import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AuthService from "../Services/AuthService";

interface User {
  id: number;
  name: string; // A propriedade 'name' é obrigatória
  email: string;
}

interface AuthContextType {
  user: User | null;
  authToken: string | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se há um token de autenticação salvo no localStorage
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setAuthToken(token);
      setUser(JSON.parse(storedUser)); // Carrega o usuário do localStorage
    }
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = await AuthService.login(identifier, password);
      if (result) {
        const { jwt, user: userData } = result;

        const adaptedUser: User = {
          id: userData.id,
          name: userData.username, // Mapeia 'username' para 'name'
          email: userData.email,
        };

        setAuthToken(jwt);
        setUser(adaptedUser);
        localStorage.setItem("authToken", jwt);
        localStorage.setItem("user", JSON.stringify(adaptedUser));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
