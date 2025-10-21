import { Redirect, Route, Switch } from "react-router-dom";
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

const App: React.FC = () => {
  useEffect(() => {
    const initializeStatusBar = async () => {
      await StatusBar.show();
      await StatusBar.setBackgroundColor({ color: "#dd2273" });
      await StatusBar.setStyle({ style: Style.Dark });
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

  const handleBackButton = (event: any) => {
    if (window.location.pathname === "/tabs/tab1") {
      event.preventDefault();
      return false;
    }
    window.history.back();
    return true;
  };

  useEffect(() => {
    CapacitorApp.addListener("backButton", handleBackButton);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);

  return (
    <ThemeProvider>
      <IonApp>
        <IonReactRouter>
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