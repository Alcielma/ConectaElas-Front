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
  name: string;
  email: string;
  tipo: string;
}

interface AuthContextType {
  user: User | null;
  authToken: string | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  isAssistant: boolean;
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
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setAuthToken(token);
      setUser(JSON.parse(storedUser));
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
          name: userData.username,
          email: userData.email,
          tipo: userData.Tipo,
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

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const data = {
        username,
        email,
        password,
      };
      const response = await AuthService.register(data);

      if (response) {
        const adaptedUser: User = {
          id: response.id,
          name: response.username,
          email: response.email,
          tipo: "Autenticado",
        };
        setUser(adaptedUser);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      return false;
    }
  };

  // console.log("user", user);

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        login,
        logout,
        register,
        isAssistant: user?.tipo === "Assistente",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
