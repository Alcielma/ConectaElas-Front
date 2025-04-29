import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AuthService from "../Services/AuthService";
import socket from "../Services/Socket";
import { useHistory } from "react-router-dom";
import { useIonRouter } from "@ionic/react";
import { IHTTPReturn } from "../Services/apiTypes";

interface User {
  id: number;
  name: string;
  email: string;
  tipo: string;
}

interface AuthContextType {
  user: User | null;
  authToken: string | null;
  login: (identifier: string, password: string) => Promise<IHTTPReturn>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<IHTTPReturn>;
  isAssistant: boolean;
  updateUser: (updatedUser: Partial<User>) => void;
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
  const history = useHistory();
  const ionRouter = useIonRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setAuthToken(token);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // useEffect(() => {
  //   if (!user) {
  //     ionRouter.push("/login", "forward", "replace");
  //   }
  // }, [user]);

  const login = async (
    identifier: string,
    password: string
  ): Promise<IHTTPReturn> => {
    const result = await AuthService.login(identifier, password);

    if (!result.success || !result.data?.jwt || !result.data?.user) {
      console.error("Falha ao tentar fazer login", result.message);
      return {
        success: false,
        message: result.message || "Falha ao fazer login",
      };
    }

    const {
      data: { jwt, user: userData },
    } = result;

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

    return { success: true, data: adaptedUser };
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    if (socket.connected) {
      socket.disconnect();
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<IHTTPReturn> => {
    const data = { username, email, password };
    const response = await AuthService.register(data);

    if (!response.success || !response.data?.jwt || !response.data?.user) {
      console.error("Falha ao tentar se registar", response.message);
      return {
        success: false,
        message: response.message || "Falha ao registrar",
      };
    }

    const { jwt, user } = response.data;

    const adaptedUser: User = {
      id: user.id,
      name: user.username,
      email: user.email,
      tipo: user.Tipo || "Autenticado",
    };

    localStorage.setItem("authToken", jwt);
    localStorage.setItem("user", JSON.stringify(adaptedUser));

    setAuthToken(jwt);
    setUser(adaptedUser);

    return {
      success: true,
      data: adaptedUser,
    };
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        login,
        logout,
        register,
        updateUser,
        isAssistant: user?.tipo === "Assistente",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
