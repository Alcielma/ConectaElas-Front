import { Redirect, Route, Switch } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  useIonRouter,
} from "@ionic/react";
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
import EsqueceuSenha from "./pages/EsqueceuSenha";
import { StatusBar, Style } from "@capacitor/status-bar";
import { ThemeProvider } from "./Contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

// CSS Ionic
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

setupIonicReact();

// Config teclado
if (Capacitor.isNativePlatform()) {
  Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  Keyboard.setScroll({ isDisabled: true });
}

// Estado global para controlar se o modal de banners está aberto
let isBannerModalOpen = false;
let closeBannerModalCallback: (() => void) | null = null;

export const setBannerModalOpen = (open: boolean, closeCallback?: () => void) => {
  isBannerModalOpen = open;
  if (closeCallback) {
    closeBannerModalCallback = closeCallback;
  }
};

// Estado global para controlar se o modal de posts está aberto
let isPostModalOpen = false;
let closePostModalCallback: (() => void) | null = null;

export const setPostModalOpen = (open: boolean, closeCallback?: () => void) => {
  isPostModalOpen = open;
  if (closeCallback) {
    closePostModalCallback = closeCallback;
  }
};

// 🔥 BACK BUTTON CORRETO COM PRIORIDADE
const BackButtonHandler: React.FC = () => {
  const router = useIonRouter();

  useEffect(() => {
    const listener = CapacitorApp.addListener("backButton", () => {
      const pathname = window.location.pathname;

      // Se o modal de posts estiver aberto, fecha ele
      if (isPostModalOpen && closePostModalCallback) {
        closePostModalCallback();
        return;
      }

      // Se o modal de banners estiver aberto, fecha ele
      if (isBannerModalOpen && closeBannerModalCallback) {
        closeBannerModalCallback();
        return;
      }

      // Se estiver em qualquer tab diferente da home
      if (
        pathname === "/tabs/tab2" ||
        pathname === "/tabs/games" ||
        pathname === "/tabs/sobre" ||
        pathname === "/tabs/tab3"
      ) {
        router.push("/tabs/tab1", "root", "replace");
        return;
      }

      // Se já estiver na home
      if (pathname === "/tabs/tab1") {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      listener.then((l) => l.remove());
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
      } catch (e) {}
    };
    initializeStatusBar();
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hide();
    };
    setTimeout(hideSplash, 3000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");

    setIsAuthenticated(!!(token && user));
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
                  <Route
                    exact
                    path="/esqueceu-senha"
                    component={EsqueceuSenha}
                  />

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

                  <Route
                    path="/categoria/:categoria"
                    component={CategoriaPosts}
                  />
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