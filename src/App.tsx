import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { App as CapacitorApp } from "@capacitor/app";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { AuthProvider } from "./Contexts/AuthContext";
import { ChatProvider } from "./Contexts/ChatContext";
import PrivateRoute from "./components/PrivateRoute";
import TabsLayout from "./components/TabsLayout";
import AssistantChat from "./pages/AssistantChat";
import AssistantChatList from "./pages/AssistantChatList";
import Onboarding from "./pages/Onboarding";
import { SplashScreen } from "@capacitor/splash-screen";
import ConfirmacaoCodigo from "./pages/ConfirmacaoCodigo";
import CategoriaPosts from "./pages/CategoriaPosts";
import { Capacitor } from "@capacitor/core";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";

// Core CSS required for Ionic components to work properly
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";
import EsqueceuSenha from "./pages/EsqueceuSenha";
import { StatusBar, Style } from "@capacitor/status-bar";
import { ThemeProvider } from "./Contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

setupIonicReact();

// Configuração do teclado para evitar sobreposição
if (Capacitor.isNativePlatform()) {
  Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  Keyboard.setScroll({ isDisabled: true });
}

// Componente responsável por tratar o botão físico de voltar
const BackButtonHandler: React.FC = () => {
  const history = useHistory();

  const handleBackButton = (event: any) => {
    const pathname = window.location.pathname;

    // Ordem dos tabs mostrados na barra inferior (da esquerda para a direita)
    const tabOrder = [
      "/tabs/tab1", // Início
      "/tabs/tab2", // Conexões
      "/tabs/quiz", // Quiz
      "/tabs/sobre", // Sobre (usar minúsculo para combinar com a rota)
      "/tabs/tab3", // Perfil
    ];

    // Mapeia rotas internas para seu tab raiz correspondente
    const tabGroupMap: { [key: string]: string } = {
      "/tabs/chat": "/tabs/tab2",
      "/tabs/ReportChannels": "/tabs/tab2",
      "/tabs/AngelContact": "/tabs/tab2",
      "/tabs/quiz-detail": "/tabs/quiz",
      "/tabs/quiz-progress": "/tabs/quiz",
      "/tabs/quiz-management": "/tabs/quiz",
      "/tabs/quiz-result": "/tabs/quiz",
    };

    // Helper para checar prefixos
    const startsWithAny = (route: string, prefixes: string[]) =>
      prefixes.some((p) => route.startsWith(p));

    // Se estiver fora de /tabs, tratar casos conhecidos e fallback para histórico
    if (!pathname.startsWith("/tabs")) {
      // Caso esteja nas rotas de chat externas, levar para Conexões
      if (pathname.startsWith("/assistantChats")) {
        event.preventDefault();
        history.replace("/tabs/tab2");
        return false;
      }
      // Fallback padrão
      window.history.back();
      return true;
    }

    // Dentro de /tabs: primeiro levar para o tab raiz do grupo quando em rotas internas
    const groupPrefixes = Object.keys(tabGroupMap);
    if (startsWithAny(pathname, groupPrefixes)) {
      const groupRoot = groupPrefixes.find((p) => pathname.startsWith(p));
      if (groupRoot) {
        const target = tabGroupMap[groupRoot];
        if (pathname !== target) {
          event.preventDefault();
          history.replace(target);
          return false;
        }
      }
    }

    // Se já estiver em um tab raiz, mover para o tab anterior (ícone à esquerda)
    const currentTabIndex = tabOrder.indexOf(pathname);
    if (currentTabIndex > 0) {
      const previousTab = tabOrder[currentTabIndex - 1];
      event.preventDefault();
      history.replace(previousTab);
      return false;
    }

    // Se estiver no primeiro tab (Início), não voltar para login/home
    if (pathname === "/tabs/tab1") {
      event.preventDefault();
      return false;
    }

    // Fallback: histórico padrão
    window.history.back();
    return true;
  };

  useEffect(() => {
    CapacitorApp.addListener("backButton", handleBackButton);
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);

  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    const initializeStatusBar = async () => {
      try {
        if (Capacitor.getPlatform() !== "web") {
          await StatusBar.show();
          await StatusBar.setBackgroundColor({ color: "#dd2273" });
          await StatusBar.setStyle({ style: Style.Dark });
        }
      } catch (e) {
      }
    };
    initializeStatusBar();
  }, []);

  const [backPressTime, setBackPressTime] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hide();
    };

    setTimeout(hideSplash, 10000);
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  

  return (
    <ThemeProvider>
      <IonApp>
        <IonReactRouter>
          <BackButtonHandler />
          <AuthProvider>
            <ChatProvider>
              <IonRouterOutlet>
                <Switch>
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/onboarding" component={Onboarding} />
                  <Route
                    exact
                    path="/confirmacao-codigo"
                    component={ConfirmacaoCodigo}
                  />
                  <Route exact path="/esqueceu-senha" component={EsqueceuSenha} />

                  <PrivateRoute path="/tabs" component={TabsLayout} />

                  <Route
                    exact
                    path="/assistantChats"
                    component={AssistantChatList}
                  />
                  <Route
                    path="/assistantChats/:chatId"
                    component={AssistantChat}
                  />

                  <Route exact path="/">
                    <Redirect to="/login" />
                  </Route>
                  <Route path="/categoria/:categoria" component={CategoriaPosts} />
                </Switch>
              </IonRouterOutlet>
            </ChatProvider>
          </AuthProvider>
          <ThemeToggle />
        </IonReactRouter>
      </IonApp>
    </ThemeProvider>
  );
};

export default App;